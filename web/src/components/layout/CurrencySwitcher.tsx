"use client";

import { useEffect } from "react";
import { useCurrency } from "@/store/currency";
import type { Currency } from "@/lib/types";

export default function CurrencySwitcher() {
  const currency = useCurrency((s) => s.currency);
  const setCurrency = useCurrency((s) => s.setCurrency);
  const hydrated = useCurrency((s) => s.hydrated);
  const setHydrated = useCurrency((s) => s.setHydrated);

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  if (!hydrated) {
    return (
      <div className="flex rounded-full border border-ink/10 p-0.5 text-xs opacity-50" aria-hidden>
        <span className="rounded-full px-2.5 py-1">FCFA</span>
        <span className="rounded-full px-2.5 py-1">€</span>
      </div>
    );
  }

  function select(c: Currency) {
    setCurrency(c);
  }

  return (
    <div
      className="flex rounded-full border border-ink/15 p-0.5 text-xs"
      role="group"
      aria-label="Choisir la devise"
    >
      <button
        type="button"
        onClick={() => select("XOF")}
        aria-pressed={currency === "XOF"}
        aria-label="Afficher les prix en Francs CFA"
        className={`inline-flex min-h-[32px] items-center rounded-full px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${currency === "XOF" ? "bg-ink text-cream" : "text-ink/60 hover:text-ink"}`}
      >
        FCFA
      </button>
      <button
        type="button"
        onClick={() => select("EUR")}
        aria-pressed={currency === "EUR"}
        aria-label="Afficher les prix en Euros"
        className={`inline-flex min-h-[32px] items-center rounded-full px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${currency === "EUR" ? "bg-ink text-cream" : "text-ink/60 hover:text-ink"}`}
      >
        €
      </button>
    </div>
  );
}
