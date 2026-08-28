"use client";

import { useEffect } from "react";
import { useCurrency } from "@/store/currency";
import type { Currency } from "@/lib/types";

type Variant = "pill" | "compact";

export default function CurrencySwitcher({ variant = "pill", onCompactClick }: { variant?: Variant; onCompactClick?: () => void }) {
  const currency = useCurrency((s) => s.currency);
  const setCurrency = useCurrency((s) => s.setCurrency);
  const hydrated = useCurrency((s) => s.hydrated);
  const setHydrated = useCurrency((s) => s.setHydrated);

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  if (!hydrated) {
    if (variant === "compact") {
      return (
        <div
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ink/10 text-xs opacity-50"
          aria-hidden
        >
          <span className="px-3 py-1">FCFA</span>
        </div>
      );
    }
    return (
      <div className="flex rounded-full border border-ink/10 p-0.5 text-xs opacity-50" aria-hidden>
        <span className="rounded-full px-2.5 py-1">FCFA</span>
        <span className="rounded-full px-2.5 py-1">€</span>
        <span className="rounded-full px-2.5 py-1">GNF</span>
      </div>
    );
  }

  function select(c: Currency) {
    setCurrency(c);
  }

  const labelMap: Record<Currency, string> = { XOF: "FCFA", EUR: "€", GNF: "GNF" };
  const nextMap: Record<Currency, Currency> = { XOF: "EUR", EUR: "GNF", GNF: "XOF" };

  if (variant === "compact") {
    const label = labelMap[currency];
    const next = nextMap[currency];
    const nextLabel = labelMap[next] === "€" ? "Euros" : labelMap[next] === "GNF" ? "Francs Guinéens" : "Francs CFA";
    return (
      <button
        type="button"
        onClick={() => (onCompactClick ? onCompactClick() : select(next))}
        aria-label={`Devise actuelle : ${label}. Toucher pour passer en ${nextLabel} ou ouvrir le menu pour choisir`}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ink/10 px-3 text-xs font-medium hover:border-ink/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {label}
      </button>
    );
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
      <button
        type="button"
        onClick={() => select("GNF")}
        aria-pressed={currency === "GNF"}
        aria-label="Afficher les prix en Francs Guinéens"
        className={`inline-flex min-h-[32px] items-center rounded-full px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${currency === "GNF" ? "bg-ink text-cream" : "text-ink/60 hover:text-ink"}`}
      >
        GNF
      </button>
    </div>
  );
}
