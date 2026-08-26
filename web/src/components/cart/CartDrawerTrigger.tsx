"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/cart";
import CartDrawer from "./CartDrawer";

export default function CartDrawerTrigger() {
  const t = useTranslations("nav");
  const lines = useCart((s) => s.lines);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard for Zustand persist
  useEffect(() => setHydrated(true), []);

  // count = sum qty products + sum qty box items — évite flash 0 avant hydration
  const count = hydrated
    ? lines.reduce((acc, l) => {
        if (l.kind === "product") return acc + l.qty;
        return acc + l.items.reduce((s, it) => s + it.qty, 0);
      }, 0)
    : 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t("cart")} — ${count} articles`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ink/10 hover:border-ink/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M6 7l1-3h10l1 3" />
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 11a3 3 0 0 0 6 0" />
        </svg>
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-medium leading-none text-cream"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
