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
        className="inline-flex min-h-[44px] items-center rounded-full px-2 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {t("cart")} ({count})
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
