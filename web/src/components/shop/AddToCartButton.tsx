"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";

export default function AddToCartButton({
  productId,
  variantId,
  inStock,
  productTitle,
  variantName,
}: {
  productId: string;
  variantId: string;
  inStock: boolean;
  productTitle: string;
  variantName: string;
}) {
  const t = useTranslations("product");
  const addProduct = useCart((s) => s.addProduct);
  const [justAdded, setJustAdded] = useState(false);

  function handle() {
    if (!inStock) return;
    addProduct({ kind: "product", productId, variantId, qty: 1 });
    track("add_to_cart", { productId, variantId, productTitle });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={!inStock}
      aria-label={
        inStock
          ? `${t("addToCart")} : ${productTitle} — ${variantName}`
          : t("outOfStock")
      }
      aria-live="polite"
      className={`inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        inStock
          ? "bg-ink text-cream hover:bg-accent"
          : "cursor-not-allowed bg-ink/20 text-ink/60"
      }`}
    >
      <span aria-live="polite" aria-atomic="true">
        {justAdded ? t("added") : inStock ? t("addToCart") : t("outOfStock")}
      </span>
    </button>
  );
}
