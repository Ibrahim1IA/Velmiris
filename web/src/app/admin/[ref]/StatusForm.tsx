"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["en_attente","confirmee","payee","expediee","livree","annulee"] as const;

export default function StatusForm({ refCode, current }: { refCode: string; current: string }) {
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${refCode}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMsg("Statut mis à jour ✓");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <select value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm">
        {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
      </select>
      <button disabled={loading} className="rounded-full bg-ink px-4 py-2 text-sm text-cream hover:bg-accent disabled:opacity-50">
        {loading ? "…" : "Enregistrer"}
      </button>
      {msg && <span className="text-xs text-ink/60">{msg}</span>}
    </form>
  );
}
