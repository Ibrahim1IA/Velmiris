"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/lib/types";

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "XOF",
      hydrated: false,
      setCurrency: (currency) => set({ currency }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "velmirys-currency",
      partialize: (s) => ({ currency: s.currency }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        // Géolocalisation légère : si pas de préférence et navigateur en zone euro, proposer EUR (non bloquant)
        if (state && !localStorage.getItem("velmirys-currency")) {
          try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const euroTz = ["Europe/Paris", "Europe/Brussels", "Europe/Berlin"];
            if (euroTz.some((z) => tz.includes(z)) || navigator.language.toLowerCase().includes("fr-fr")) {
              // on garde XOF par défaut (Sénégal), mais l'utilisateur pourra switcher
            }
          } catch {}
        }
      },
    }
  )
);
