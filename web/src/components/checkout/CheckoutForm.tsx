"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import type { Currency } from "@/lib/types";
import { track } from "@/lib/analytics";

export default function CheckoutForm({
  totalXof,
  totalEur,
  totalGnf,
  currency = "XOF",
}: {
  totalXof: number;
  totalEur: number;
  totalGnf: number;
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

  const total = currency === "GNF" ? totalGnf : currency === "EUR" ? totalEur : totalXof;
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; zone?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fe: { name?: string; phone?: string; zone?: string } = {};
    if (!name.trim() || name.trim().length < 2) fe.name = "Nom requis (2 caractères min).";
    if (!/^\+?[0-9\s\-]{8,20}$/.test(phone.trim())) fe.phone = "Téléphone invalide (8–20 chiffres, + autorisé).";
    if (!zone.trim()) fe.zone = "Zone de livraison requise.";
    if (lines.length === 0) {
      setFieldErrors(fe);
      return setError("Panier vide.");
    }
    if (Object.keys(fe).length > 0) {
      setFieldErrors(fe);
      const first = Object.values(fe)[0];
      setError(first ?? "Veuillez corriger les champs indiqués.");
      // focus premier champ en erreur
      if (fe.name) document.getElementById("checkout-name")?.focus();
      else if (fe.phone) document.getElementById("checkout-phone")?.focus();
      else if (fe.zone) document.getElementById("checkout-zone")?.focus();
      return;
    }
    setFieldErrors({});

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
      track("checkout_whatsapp", {
        ref: String(data.ref || ""),
        currency,
        total,
        items: String(lines.length),
      });
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
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate aria-describedby="checkout-hint">
      {/* Honeypot */}
      <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div>
        <label htmlFor="checkout-name" className="text-sm font-medium">
          Nom & prénom <span className="text-accent" aria-hidden="true">*</span>
        </label>
        <input
          id="checkout-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Awa Diop"
          required
          aria-required="true"
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "error-name checkout-name-hint" : "checkout-name-hint"}
          autoComplete="name"
          className={`mt-1 w-full rounded-xl border bg-cream px-4 py-3 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${fieldErrors.name ? "border-accent bg-accent/5" : "border-ink/15 focus:border-ink"}`}
        />
        <p id="checkout-name-hint" className="mt-1 text-xs text-ink/60">
          2 caractères minimum.
        </p>
        {fieldErrors.name && (
          <p id="error-name" role="alert" className="mt-1 text-xs text-accent">
            {fieldErrors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="checkout-phone" className="text-sm font-medium">
          Téléphone <span className="text-accent" aria-hidden="true">*</span>
        </label>
        <input
          id="checkout-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+221 77 000 00 00"
          inputMode="tel"
          required
          aria-required="true"
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? "error-phone checkout-phone-hint" : "checkout-phone-hint"}
          autoComplete="tel"
          className={`mt-1 w-full rounded-xl border bg-cream px-4 py-3 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${fieldErrors.phone ? "border-accent bg-accent/5" : "border-ink/15 focus:border-ink"}`}
        />
        <p id="checkout-phone-hint" className="mt-1 text-xs text-ink/60">
          Format international, 8–20 chiffres.
        </p>
        {fieldErrors.phone && (
          <p id="error-phone" role="alert" className="mt-1 text-xs text-accent">
            {fieldErrors.phone}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="checkout-zone" className="text-sm font-medium">
          Zone de livraison <span className="text-accent" aria-hidden="true">*</span>
        </label>
        <input
          id="checkout-zone"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          placeholder="Dakar — Almadies"
          required
          aria-required="true"
          aria-invalid={!!fieldErrors.zone}
          aria-describedby={fieldErrors.zone ? "error-zone checkout-zone-hint" : "checkout-zone-hint"}
          autoComplete="address-level2"
          className={`mt-1 w-full rounded-xl border bg-cream px-4 py-3 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${fieldErrors.zone ? "border-accent bg-accent/5" : "border-ink/15 focus:border-ink"}`}
        />
        <p id="checkout-zone-hint" className="mt-1 text-xs text-ink/60">
          Livraison & frais confirmés sur WhatsApp.
        </p>
        {fieldErrors.zone && (
          <p id="error-zone" role="alert" className="mt-1 text-xs text-accent">
            {fieldErrors.zone}
          </p>
        )}
      </div>

      <div className="mt-2 rounded-xl bg-sand/40 p-4 text-sm">
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-medium">{formatPrice(total, currency)}</span>
        </div>
        <p className="mt-1 text-xs text-ink/60">Emballage cadeau offert · Paiement à confirmer sur WhatsApp.</p>
      </div>

      {error && (
        <p role="alert" aria-live="assertive" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-ink py-3.5 text-sm font-medium text-cream transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Création de la commande…" : `Commander sur WhatsApp — ${formatPrice(total, currency)}`}
      </button>
      <p id="checkout-hint" className="text-center text-xs text-ink/60">
        Vous serez redirigée vers WhatsApp avec un message pré-rempli.
      </p>
    </form>
  );
}
