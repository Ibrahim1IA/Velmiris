"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import {
  resolveCartLines,
  cartTotals,
  type ResolvedLine,
} from "@/lib/cart-helpers";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("cart");
  const lines = useCart((s) => s.lines);
  const removeLine = useCart((s) => s.removeLine);
  const updateQty = useCart((s) => s.updateQty);
  const [resolved, setResolved] = useState<ResolvedLine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on drawer open
    setLoading(true);
    resolveCartLines(lines)
      .then((r) => {
        if (!cancelled) setResolved(r);
      })
      .catch(() => {
        if (!cancelled) setResolved([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, lines]);

  const { totalXof } = cartTotals(resolved);

  // lock scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        aria-label="Fermer le panier"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("drawerTitle")}
        className="relative flex h-full w-full max-w-md flex-col bg-cream shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-sand px-6 py-4">
          <h2 className="font-serif text-xl">
            {t("drawerTitle")} ({lines.length})
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-sand"
            aria-label="Fermer"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-ink/60">{t("empty")}</p>
              <Link
                href="/boutique"
                onClick={onClose}
                className="mt-4 inline-block rounded-full bg-ink px-6 py-2 text-sm text-cream hover:bg-accent"
              >
                {t("emptyCta")}
              </Link>
            </div>
          ) : loading ? (
            <p className="py-8 text-center text-sm text-ink/50">Chargement…</p>
          ) : (
            <ul className="flex flex-col gap-6">
              {resolved.map((r) =>
                r.kind === "product" ? (
                  <li
                    key={`p-${r.index}`}
                    className="flex gap-4 border-b border-sand pb-6"
                  >
                    <div
                      className="h-20 w-16 shrink-0 rounded-xl"
                      style={{ backgroundColor: r.variant.hex }}
                      aria-hidden
                    />
                    <div className="flex flex-1 flex-col">
                      <Link
                        href={`/boutique/${r.product.slug.current}?variant=${r.variant._key}`}
                        onClick={onClose}
                        className="text-sm font-medium hover:text-accent"
                      >
                        {r.product.title}
                      </Link>
                      <p className="text-sm text-ink/60">
                        {r.variant.colorName}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {formatPrice(r.product.priceXof, "XOF")}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQty(r.index, r.qty - 1)}
                          className="h-7 w-7 rounded-full border border-ink/15 text-sm hover:border-ink"
                          aria-label="Diminuer quantité"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm">
                          {r.qty}
                        </span>
                        <button
                          onClick={() => updateQty(r.index, r.qty + 1)}
                          className="h-7 w-7 rounded-full border border-ink/15 text-sm hover:border-ink"
                          aria-label="Augmenter quantité"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeLine(r.index)}
                          className="ml-auto text-xs text-ink/50 hover:text-accent"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li
                    key={`b-${r.index}`}
                    className="rounded-2xl border border-sand bg-sand/40 p-4"
                  >
                    <p className="text-sm font-medium">
                      {t("boxCount", { n: r.index + 1 })} — {r.items.length}{" "}
                      articles
                    </p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {r.items.map((it, j) => (
                        <li key={j} className="text-sm text-ink/70">
                          • {it.product.title} — {it.variant.colorName} ×
                          {it.qty}
                        </li>
                      ))}
                    </ul>
                    {r.giftMessage && (
                      <p className="mt-2 text-sm italic text-ink/60">
                        “{r.giftMessage}”
                      </p>
                    )}
                    <p className="mt-2 text-sm font-medium">
                      {formatPrice(r.subtotalXof, "XOF")}
                    </p>
                    <button
                      onClick={() => removeLine(r.index)}
                      className="mt-2 text-xs text-ink/50 hover:text-accent"
                    >
                      {t("remove")}
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-sand px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t("total")}</span>
              <span className="font-medium">
                {formatPrice(totalXof, "XOF")}
              </span>
            </div>
            <Link
              href="/panier"
              onClick={onClose}
              className="mt-4 block w-full rounded-full bg-ink py-3 text-center text-sm font-medium text-cream hover:bg-accent"
            >
              {t("seeCart")}
            </Link>
            <p className="mt-2 text-center text-xs text-ink/50">
              Emballage cadeau offert
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}
