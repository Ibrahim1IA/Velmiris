import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  payee: "Payée",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  // Auth
  const auth = await createAuthServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) redirect("/admin/login");
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SHOP_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-serif text-2xl">Accès refusé</h1>
        <p className="mt-2 text-sm text-ink/60">Connecté en tant que {user.email} — seul {adminEmail} est autorisé.</p>
        <form action="/admin/logout" method="post" className="mt-6">
          <button formAction="/admin/logout" className="rounded-full border px-6 py-2 text-sm">Se déconnecter</button>
        </form>
      </div>
    );
  }

  // Data — utilise service_role pour lire malgré RLS
  const supabase = createServerClient();
  let query = supabase
    .from("orders")
    .select("id, ref, status, currency, total, created_at, customer_id, customers(full_name, phone, delivery_zone)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status && ["en_attente", "confirmee", "payee", "expediee", "livree", "annulee"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data: orders, error } = await query;
  if (error) {
    return <div className="mx-auto max-w-6xl px-6 py-12"><p className="text-accent">Erreur chargement: {error.message}</p></div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Admin — Commandes ({orders?.length ?? 0})</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink/60">{user.email}</span>
          <form action="/admin/logout" method="post">
            <button className="rounded-full border border-ink/15 px-4 py-1.5 text-sm hover:border-ink">Déconnexion</button>
          </form>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["", "en_attente", "confirmee", "payee", "expediee", "livree", "annulee"].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/admin?status=${s}` : "/admin"}
            className={`rounded-full border px-3 py-1 text-sm ${status === s || (!status && s === "") ? "bg-ink text-cream border-ink" : "border-ink/15 hover:border-ink"}`}
          >
            {s ? STATUS_LABEL[s] : "Toutes"}
          </Link>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-sand">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-sand/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Réf</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o: unknown) => {
              const order = o as { ref: string; status: string; currency: string; total: number; created_at: string; customers: { full_name: string; phone: string; delivery_zone: string } | null };
              return (
                <tr key={order.ref} className="border-t border-sand">
                  <td className="px-4 py-3 font-mono text-xs">{order.ref}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.customers?.full_name ?? "—"}</div>
                    <div className="text-xs text-ink/60">{order.customers?.phone} · {order.customers?.delivery_zone}</div>
                  </td>
                  <td className="px-4 py-3">{formatPrice(Number(order.total), order.currency as "XOF" | "EUR")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${order.status === "en_attente" ? "bg-amber-100" : order.status === "annulee" ? "bg-red-100" : "bg-green-100"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/60">{new Date(order.created_at).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/${order.ref}`} className="text-xs underline hover:text-accent">Détail</Link>
                  </td>
                </tr>
              );
            })}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-ink/60">Aucune commande.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
