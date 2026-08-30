import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { createServerClient } from "@/lib/supabase/server";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { CartLine, OrderData, Currency } from "@/lib/types";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { Resend } from "resend";

// Rate limiting simple en mémoire (V1, PRD §13)
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10; // 10 requêtes / minute / IP
const RATE_WINDOW = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count += 1;
  return false;
}

// Client Sanity serveur (sans CDN, données fraîches) — PRD §9.2 prix source vérité = Sanity
const sanityServer = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

type Body = {
  customerName: string;
  phone: string;
  deliveryZone: string;
  lines: CartLine[];
  currency?: Currency;
  website?: string; // honeypot
};

function generateRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I/O/0/1
  let ref = "VEL-";
  for (let i = 0; i < 4; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });
    }

    const body: Body = await req.json().catch(() => null as unknown as Body);
    if (!body) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

    // Honeypot
    if (body.website && body.website.trim() !== "") {
      return NextResponse.json({ error: "Requête rejetée." }, { status: 400 });
    }

    const { customerName, phone, deliveryZone, lines, currency = "XOF" } = body;

    // Validation
    if (!customerName?.trim() || customerName.trim().length < 2) {
      return NextResponse.json({ error: "Nom requis (2 caractères min)." }, { status: 400 });
    }
    if (!phone?.trim() || !/^\+?[0-9\s\-]{8,20}$/.test(phone.trim())) {
      return NextResponse.json({ error: "Téléphone invalide (format international)." }, { status: 400 });
    }
    if (!deliveryZone?.trim()) {
      return NextResponse.json({ error: "Zone de livraison requise." }, { status: 400 });
    }
    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "Panier vide." }, { status: 400 });
    }
    if (currency !== "XOF" && currency !== "EUR" && currency !== "GNF") {
      return NextResponse.json({ error: "Devise invalide." }, { status: 400 });
    }
    // Validation lignes
    for (const l of lines) {
      if (l.kind === "product") {
        if (!l.productId || !l.variantId || !Number.isInteger(l.qty) || l.qty < 1) {
          return NextResponse.json({ error: "Ligne produit invalide." }, { status: 400 });
        }
      } else if (l.kind === "box") {
        if (!Array.isArray(l.items) || l.items.length < 2 || l.items.length > 5) {
          return NextResponse.json({ error: "Box invalide (2 à 5 articles)." }, { status: 400 });
        }
        if (!l.cardDesignId) return NextResponse.json({ error: "Carte cadeau requise." }, { status: 400 });
        if (l.giftMessage && l.giftMessage.length > 250) {
          return NextResponse.json({ error: "Message cadeau trop long (250 max)." }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: "Type de ligne invalide." }, { status: 400 });
      }
    }

    // Récupération catalogue depuis Sanity (source vérité)
    const productIds = Array.from(
      new Set(
        lines.flatMap((l) => (l.kind === "product" ? [l.productId] : l.items.map((i) => i.productId))),
      ),
    );
    const cardIds = Array.from(
      new Set(lines.filter((l) => l.kind === "box").map((l) => (l as { cardDesignId: string }).cardDesignId)),
    );

    const products: Array<{
      _id: string;
      title: string;
      priceXof: number;
      priceEur: number;
      priceGnf: number;
      variants: Array<{ _key: string; colorName: string; sku?: string; inStock: boolean }>;
    }> = await sanityServer.fetch(
      `*[_type == "product" && _id in $ids]{ _id, title, priceXof, priceEur, priceGnf, variants[]{ _key, colorName, inStock, sku } }`,
      { ids: productIds },
    );

    const cards: Array<{ _id: string; name: string }> =
      cardIds.length > 0
        ? await sanityServer.fetch(`*[_type == "cardDesign" && _id in $ids]{ _id, name }`, { ids: cardIds })
        : [];

    const byProduct = new Map(products.map((p) => [p._id, p]));
    const byCard = new Map(cards.map((c) => [c._id, c]));

    // Recalcul prix + vérif stock
    const orderItems: OrderData["items"] = [];
    const orderBoxes: OrderData["boxes"] = [];
    let subtotal = 0;

    function unitPriceFor(product: { priceXof: number; priceEur: number; priceGnf: number }, cur: Currency) {
      if (cur === "EUR") return product.priceEur;
      if (cur === "GNF") return product.priceGnf;
      return product.priceXof;
    }

    for (const line of lines) {
      if (line.kind === "product") {
        const product = byProduct.get(line.productId);
        if (!product) return NextResponse.json({ error: `Produit introuvable: ${line.productId}` }, { status: 400 });
        const variant = product.variants.find((v) => v._key === line.variantId);
        if (!variant) return NextResponse.json({ error: `Variante introuvable: ${line.variantId}` }, { status: 400 });
        if (!variant.inStock) return NextResponse.json({ error: `Article épuisé: ${product.title} — ${variant.colorName}` }, { status: 400 });
        const unitPrice = unitPriceFor(product, currency as Currency);
        subtotal += unitPrice * line.qty;
        orderItems.push({ name: product.title, color: variant.colorName, qty: line.qty, unitPrice });
      } else {
        // box
        const card = byCard.get(line.cardDesignId);
        const cardName = card?.name || line.cardDesignId;
        const boxItems: OrderData["boxes"][number]["items"] = [];
        let boxSubtotal = 0;
        for (const it of line.items) {
          const product = byProduct.get(it.productId);
          if (!product) return NextResponse.json({ error: `Produit box introuvable: ${it.productId}` }, { status: 400 });
          const variant = product.variants.find((v) => v._key === it.variantId);
          if (!variant) return NextResponse.json({ error: `Variante box introuvable: ${it.variantId}` }, { status: 400 });
          if (!variant.inStock) return NextResponse.json({ error: `Article box épuisé: ${product.title} — ${variant.colorName}` }, { status: 400 });
          const unitPrice = unitPriceFor(product, currency as Currency);
          boxSubtotal += unitPrice * it.qty;
          boxItems.push({ name: product.title, color: variant.colorName, qty: it.qty, unitPrice });
        }
        subtotal += boxSubtotal;
        orderBoxes.push({ items: boxItems, cardName, giftMessage: line.giftMessage, subtotal: boxSubtotal });
      }
    }

    const total = subtotal; // emballage offert, livraison à confirmer (PRD §6.2)

    // Génération ref unique
    const supabase = createServerClient();
    let ref = "";
    for (let i = 0; i < 10; i++) {
      const candidate = generateRef();
      const { data } = await supabase.from("orders").select("id").eq("ref", candidate).limit(1);
      if (!data || data.length === 0) {
        ref = candidate;
        break;
      }
    }
    if (!ref) return NextResponse.json({ error: "Impossible de générer une référence, réessayez." }, { status: 500 });

    // Création customer + order + items
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .insert({ full_name: customerName.trim(), phone: phone.trim(), delivery_zone: deliveryZone.trim() })
      .select("id")
      .single();
    if (custErr || !customer) {
      console.error("[orders] customer insert", custErr);
      return NextResponse.json({ error: "Erreur création client." }, { status: 500 });
    }

    const payload: OrderData = {
      ref,
      customerName: customerName.trim(),
      phone: phone.trim(),
      deliveryZone: deliveryZone.trim(),
      items: orderItems,
      boxes: orderBoxes,
      total,
      currency,
    };

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        ref,
        customer_id: customer.id,
        status: "en_attente",
        currency,
        subtotal,
        total,
        payload,
      })
      .select("id, ref")
      .single();
    if (orderErr || !order) {
      console.error("[orders] order insert", orderErr);
      return NextResponse.json({ error: "Erreur création commande." }, { status: 500 });
    }

    // Boxes + order_items
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      if (line.kind === "product") {
        const product = byProduct.get(line.productId)!;
        const unitPrice = unitPriceFor(product, currency as Currency);
        const { error } = await supabase.from("order_items").insert({
          order_id: order.id,
          parent_box_id: null,
          product_id: line.productId,
          variant_id: line.variantId,
          qty: line.qty,
          unit_price: unitPrice,
        });
        if (error) console.error("[orders] order_item product", error);
      } else {
        const { data: box, error: boxErr } = await supabase
          .from("boxes")
          .insert({
            order_id: order.id,
            gift_message: line.giftMessage || null,
            card_design_id: line.cardDesignId,
          })
          .select("id")
          .single();
        if (boxErr || !box) {
          console.error("[orders] box insert", boxErr);
          continue;
        }
        for (const it of line.items) {
          const product = byProduct.get(it.productId)!;
          const unitPrice = unitPriceFor(product, currency as Currency);
          const { error } = await supabase.from("order_items").insert({
            order_id: order.id,
            parent_box_id: box.id,
            product_id: it.productId,
            variant_id: it.variantId,
            qty: it.qty,
            unit_price: unitPrice,
          });
          if (error) console.error("[orders] order_item box", error);
        }
      }
    }

    // Notification email (Resend) — non bloquant — Sanity-first, env fallback
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      let notifyTo: string[] = [];
      try {
        const s = await sanityServer.fetch<{ notificationEmails?: string[]; email?: string } | null>(
          `*[_type == "siteSettings"][0]{ notificationEmails, email }`,
        );
        if (s?.notificationEmails?.length) notifyTo = s.notificationEmails.filter(Boolean);
        else if (s?.email) notifyTo = [s.email];
      } catch {
        // ignore, fallback env
      }
      if (notifyTo.length === 0 && process.env.SHOP_EMAIL) notifyTo = [process.env.SHOP_EMAIL];
      // Exigence : nimagamoumou@gmail.com toujours en copie (tant que non retiré volontairement en Studio)
      const requiredExtra = "nimagamoumou@gmail.com";
      if (notifyTo.length > 0 && !notifyTo.map((e) => e.toLowerCase()).includes(requiredExtra)) {
        notifyTo = [...notifyTo, requiredExtra];
      }
      // dedupe
      notifyTo = Array.from(new Set(notifyTo.map((e) => e.toLowerCase()))).map((l) => notifyTo.find((o) => o.toLowerCase() === l)!);
      if (notifyTo.length > 0) {
        try {
          const resend = new Resend(resendKey);
          const itemsList = [...orderItems.map((i) => `• ${i.name} — ${i.color} ×${i.qty}`), ...orderBoxes.flatMap((b, n) => [`Box n°${n + 1} (${b.cardName})`, ...b.items.map((i) => `  • ${i.name} — ${i.color} ×${i.qty}`)])].join("\n");
          await resend.emails.send({
            from: "VELMIRYS <onboarding@resend.dev>",
            to: notifyTo.length === 1 ? notifyTo[0] : notifyTo,
            subject: `Nouvelle commande ${ref} — ${customerName.trim()}`,
            text: `Réf: ${ref}\nClient: ${customerName.trim()} — ${phone.trim()} — ${deliveryZone.trim()}\nDevise: ${currency}\nTotal: ${total}\n\n${itemsList}\n\nVoir Supabase: orders ref ${ref}`,
          });
        } catch (e) {
          console.warn("[orders] resend failed", e);
        }
      }
    }

    // WhatsApp — Sanity-first, env fallback
    let rawNumber = "";
    try {
      const s = await sanityServer.fetch<{ whatsappNumber?: string } | null>(`*[_type == "siteSettings"][0]{ whatsappNumber }`);
      rawNumber = s?.whatsappNumber || process.env.NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER || "";
    } catch {
      rawNumber = process.env.NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER || "";
    }
    const shopNumber = rawNumber.replace(/[^0-9]/g, "");
    const message = buildWhatsAppMessage(payload);
    const whatsappUrl = shopNumber ? buildWhatsAppUrl(shopNumber, message) : "";

    return NextResponse.json({ ref, whatsappUrl, message, total, currency });
  } catch (e) {
    console.error("[orders] unhandled", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
