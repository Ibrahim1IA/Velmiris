import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { OrderData } from "@/lib/types";
import StatusForm from "./StatusForm";

export const dynamic = "force-dynamic";

export default async function AdminDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const auth = await createAuthServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) redirect("/admin/login");
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SHOP_EMAIL;
  if (adminEmail && user.email !== adminEmail) redirect("/admin");

  const supabase = createServerClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, ref, status, currency, total, subtotal, created_at, payload, customers(full_name, phone, delivery_zone)")
    .eq("ref", ref)
    .single();

  if (error || !order) notFound();

  const payload = order.payload as OrderData;
  // Boxes + items
  const { data: boxes } = await supabase.from("boxes").select("id, gift_message, card_design_id").eq("order_id", order.id);
  const { data: items } = await supabase.from("order_items").select("id, product_id, variant_id, qty, unit_price, parent_box_id").eq("order_id", order.id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/admin" className="text-sm text-ink/50 hover:text-accent">← Retour liste</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Commande {order.ref}</h1>
          <p className="mt-1 text-sm text-ink/50">{new Date(order.created_at).toLocaleString("fr-FR")} · {order.currency} · {formatPrice(Number(order.total), order.currency as "XOF"|"EUR")}</p>
          <p className="mt-2 text-sm"><span className="font-medium">{(order.customers as unknown as {full_name:string})?.full_name}</span> — {(order.customers as unknown as {phone:string})?.phone} — {(order.customers as unknown as {delivery_zone:string})?.delivery_zone}</p>
        </div>
        <StatusForm refCode={order.ref} current={order.status} />
      </div>

      <div className="mt-8 grid gap-6">
        <div className="rounded-2xl border border-sand bg-cream p-6">
          <h2 className="font-medium">Payload (WhatsApp)</h2>
          <ul className="mt-3 text-sm">
            {payload.items.map((it,i)=>(<li key={i} className="flex justify-between"><span>{it.name} — {it.color} ×{it.qty}</span><span>{formatPrice(it.unitPrice*it.qty, payload.currency)}</span></li>))}
            {payload.boxes.map((b,idx)=>(
              <li key={idx} className="mt-3 rounded-xl bg-sand/30 p-3">
                <p className="font-medium">Box n°{idx+1} — {formatPrice(b.subtotal, payload.currency)} · Carte {b.cardName}</p>
                <ul className="text-ink/70">{b.items.map((it,j)=><li key={j}>• {it.name} — {it.color} ×{it.qty}</li>)}</ul>
                {b.giftMessage && <p className="mt-1 text-xs italic">“{b.giftMessage}”</p>}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right font-medium">Total {formatPrice(payload.total, payload.currency)}</p>
        </div>

        <div className="rounded-2xl border border-sand p-6">
          <h2 className="font-medium">Détail technique (Supabase)</h2>
          <p className="mt-2 text-xs text-ink/50">Boxes: {boxes?.length ?? 0} · Items: {items?.length ?? 0}</p>
          <ul className="mt-2 text-xs">
            {items?.map((it: unknown) => {
              const row = it as { product_id:string; variant_id:string; qty:number; unit_price:number; parent_box_id:string|null };
              return <li key={row.product_id+row.variant_id} className="flex justify-between border-t border-sand/50 py-1"><span>{row.product_id}:{row.variant_id} ×{row.qty} {row.parent_box_id ? "(box)" : ""}</span><span>{row.unit_price}</span></li>;
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
