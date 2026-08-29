"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DraftItem {
  productId: string;
  variantId: string;
  hex: string;
  category: "foulard" | "bonnet" | "epingle";
  title: string;
  colorName: string;
  priceXof: number;
  priceEur: number;
  priceGnf: number;
  image?: unknown;
}

interface BoxDraftState {
  items: DraftItem[]; // 2-5
  giftMessage: string;
  cardDesignId: string | null;
  createdAt: number | null; // pour expiration 7j
  addItem: (item: DraftItem) => boolean;
  removeItem: (index: number) => void;
  setGiftMessage: (msg: string) => void;
  setCard: (id: string) => void;
  clear: () => void;
  isExpired: () => boolean;
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const useBoxDraft = create<BoxDraftState>()(
  persist(
    (set, get) => ({
      items: [],
      giftMessage: "",
      cardDesignId: null,
      createdAt: null,
      addItem: (item) => {
        const { items } = get();
        if (items.length >= 5) return false;
        // doublons autorisés (PRD) — on push quand même
        const now = Date.now();
        set({
          items: [...items, item],
          createdAt: get().createdAt ?? now,
        });
        return true;
      },
      removeItem: (index) =>
        set((s) => ({
          items: s.items.filter((_, i) => i !== index),
        })),
      setGiftMessage: (giftMessage) => {
        const msg = giftMessage.slice(0, 250);
        set({ giftMessage: msg, createdAt: get().createdAt ?? Date.now() });
      },
      setCard: (cardDesignId) => set({ cardDesignId, createdAt: get().createdAt ?? Date.now() }),
      clear: () => set({ items: [], giftMessage: "", cardDesignId: null, createdAt: null }),
      isExpired: () => {
        const c = get().createdAt;
        if (!c) return false;
        return Date.now() - c > SEVEN_DAYS;
      },
    }),
    {
      name: "velmirys-box-draft",
      version: 2,
      // expiration 7j vérifiée à l'hydratation
      onRehydrateStorage: () => (state) => {
        if (state?.createdAt && Date.now() - state.createdAt > SEVEN_DAYS) {
          state.items = [];
          state.giftMessage = "";
          state.cardDesignId = null;
          state.createdAt = null;
        }
      },
    }
  )
);

// Expose for e2e Playwright (PRD §9.3) — permet injection sans reload lent
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__velmirysBoxDraft = useBoxDraft;
}
