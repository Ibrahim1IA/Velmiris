"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartBoxLine, CartLine, CartProductLine } from "@/lib/types";

// Panier persisté en localStorage (30 jours) — PRD §6.3
interface CartState {
  lines: CartLine[];
  addProduct: (line: CartProductLine) => void;
  addBox: (line: CartBoxLine) => void;
  removeLine: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addProduct: (line) =>
        set((state) => {
          const existing = state.lines.findIndex(
            (l) =>
              l.kind === "product" &&
              l.productId === line.productId &&
              l.variantId === line.variantId,
          );
          if (existing >= 0) {
            const lines = [...state.lines];
            const current = lines[existing] as CartProductLine;
            lines[existing] = { ...current, qty: current.qty + line.qty };
            return { lines };
          }
          return { lines: [...state.lines, line] };
        }),
      addBox: (line) => set((state) => ({ lines: [...state.lines, line] })),
      removeLine: (index) =>
        set((state) => ({ lines: state.lines.filter((_, i) => i !== index) })),
      updateQty: (index, qty) =>
        set((state) => ({
          lines: state.lines.map((l, i) =>
            i === index && l.kind === "product" ? { ...l, qty: Math.max(1, qty) } : l,
          ),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "velmirys-cart" },
  ),
);

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__velmirysCart = useCart;
}
