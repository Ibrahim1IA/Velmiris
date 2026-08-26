import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import type { OrderData } from "@/lib/types";
import ConfirmationActions from "./ConfirmationActions";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  if (!ref) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-serif text-3xl">Commande introuvable</h1>
        <p className="mt-4 text-ink/60">Référence manquante.</p>
        <Link href="/boutique" className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Retour boutique
        </Link>
      </div>
    );
  }

  let order: { ref: string; payload: OrderData; total: number; currency: string } | null = null;
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("orders").select("ref, payload, total, currency").eq("ref", ref).single();
    if (!error && data) {
      order = data as unknown as { ref: string; payload: OrderData; total: number; currency: string };
    }
  } catch {
    // ignore
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-serif text-3xl">Commande {ref} introuvable</h1>
        <p className="mt-4 text-ink/60">Vérifiez la référence ou contactez la boutique sur WhatsApp.</p>
        <Link href="/boutique" className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Retour boutique
        </Link>
      </div>
    );
  }

  const payload = order.payload as OrderData;
  const shopNumber = (process.env.NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER || "").replace(/[^0-9]/g, "");
  const message = buildWhatsAppMessage(payload);
  const whatsappUrl = shopNumber ? buildWhatsAppUrl(shopNumber, message) : "";

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <div className="rounded-2xl border border-sand bg-cream p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Merci 🤍</p>
        <h1 className="mt-3 font-serif text-3xl tracking-tight">Commande {order.ref} enregistrée</h1>
        <p className="mt-4 text-ink/60">
          Votre commande est bien enregistrée en statut <span className="font-medium">en attente</span>. Ouvrez WhatsApp pour confirmer avec la boutique.
        </p>
        <p className="mt-2 text-sm text-ink/60">Référence à rappeler : <span className="font-mono font-medium text-ink">{order.ref}</span></p>
      </div>

      <div className="mt-8 rounded-2xl border border-sand bg-sand/30 p-6">
        <h2 className="font-medium">Récapitulatif</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {payload.items.map((it, i) => (
            <li key={`i-${i}`} className="flex justify-between">
              <span>{it.name} — {it.color} ×{it.qty}</span>
              <span className="font-medium">{formatPrice(it.unitPrice * it.qty, payload.currency)}</span>
            </li>
          ))}
          {payload.boxes.map((b, idx) => (
            <li key={`b-${idx}`} className="mt-2 rounded-xl bg-cream p-3">
              <p className="font-medium">Box n°{idx + 1} — {formatPrice(b.subtotal, payload.currency)}</p>
              <ul className="mt-1 text-ink/60">
                {b.items.map((it, j) => (
                  <li key={j}>• {it.name} — {it.color} ×{it.qty}</li>
                ))}
              </ul>
              <p className="mt-1 text-xs">Carte : « {b.cardName} »</p>
              {b.giftMessage && <p className="mt-1 text-xs italic">“{b.giftMessage}”</p>}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-sand pt-3 font-medium">
          <span>Total</span>
          <span>{formatPrice(payload.total, payload.currency)}</span>
        </div>
        <p className="mt-2 text-xs text-ink/60">Livraison à confirmer ensemble sur WhatsApp.</p>
      </div>

      <ConfirmationActions whatsappUrl={whatsappUrl} message={message} refCode={order.ref} />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/boutique" className="flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-ink/15 py-3 text-center text-sm hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Retour boutique
        </Link>
        <Link href="/panier" className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-ink py-3 text-center text-sm text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Nouveau panier
        </Link>
      </div>
    </div>
  );
}
