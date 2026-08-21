"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/cart";
import CartDrawer from "./CartDrawer";

export default function CartDrawerTrigger() {
  const t = useTranslations("nav");
  const lines = useCart((s) => s.lines);
  const [open, setOpen] = useState(false);

  // count = sum qty products + sum qty box items
  const count = lines.reduce((acc, l) => {
    if (l.kind === "product") return acc + l.qty;
    return acc + l.items.reduce((s, it) => s + it.qty, 0);
  }, 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`${t("cart")} — ${count} articles`}
        className="transition-colors hover:text-accent"
      >
        {t("cart")} ({count})
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
