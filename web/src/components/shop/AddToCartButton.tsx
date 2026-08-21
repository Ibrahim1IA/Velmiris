"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useTranslations } from "next-intl";

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
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <button
      onClick={handle}
      disabled={!inStock}
      aria-label={
        inStock
          ? `${t("addToCart")} : ${productTitle} — ${variantName}`
          : t("outOfStock")
      }
      className={`w-full rounded-full px-8 py-3.5 text-sm font-medium transition-colors ${
        inStock
          ? "bg-ink text-cream hover:bg-accent"
          : "cursor-not-allowed bg-ink/20 text-ink/50"
      }`}
    >
      {justAdded ? t("added") : inStock ? t("addToCart") : t("outOfStock")}
    </button>
  );
}
