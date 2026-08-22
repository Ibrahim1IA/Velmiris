"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import type { Currency } from "@/lib/types";

export default function CheckoutForm({
  totalXof,
  totalEur,
  currency = "XOF",
}: {
  totalXof: number;
  totalEur: number;
  currency?: Currency;
}) {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = currency === "XOF" ? totalXof : totalEur;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || name.trim().length < 2) return setError("Nom requis (2 caractères min).");
    if (!/^\+?[0-9\s\-]{8,20}$/.test(phone.trim())) return setError("Téléphone invalide.");
    if (!zone.trim()) return setError("Zone de livraison requise.");
    if (lines.length === 0) return setError("Panier vide.");

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: phone.trim(),
          deliveryZone: zone.trim(),
          lines,
          currency,
          website: hp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur commande.");
      // Succès : ouvrir WhatsApp + aller confirmation
      clear();
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
      router.push(`/commande/confirmation?ref=${encodeURIComponent(data.ref)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
      {/* Honeypot */}
      <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      <div>
        <label htmlFor="checkout-name" className="text-sm font-medium">
          Nom & prénom <span className="text-accent">*</span>
        </label>
        <input
          id="checkout-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Awa Diop"
          required
          className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="checkout-phone" className="text-sm font-medium">
          Téléphone <span className="text-accent">*</span>
        </label>
        <input
          id="checkout-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+221 77 000 00 00"
          inputMode="tel"
          required
          className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="checkout-zone" className="text-sm font-medium">
          Zone de livraison <span className="text-accent">*</span>
        </label>
        <input
          id="checkout-zone"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          placeholder="Dakar — Almadies"
          required
          className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <p className="mt-1 text-xs text-ink/50">Livraison & frais confirmés sur WhatsApp.</p>
      </div>

      <div className="mt-2 rounded-xl bg-sand/40 p-4 text-sm">
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-medium">{formatPrice(total, currency)}</span>
        </div>
        <p className="mt-1 text-xs text-ink/50">Emballage cadeau offert · Paiement à confirmer sur WhatsApp.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-ink py-3.5 text-sm font-medium text-cream transition-colors hover:bg-accent disabled:opacity-50"
      >
        {loading ? "Création de la commande…" : `Commander sur WhatsApp — ${formatPrice(total, currency)}`}
      </button>
      <p className="text-center text-xs text-ink/40">Vous serez redirigée vers WhatsApp avec un message pré-rempli.</p>
    </form>
  );
}
