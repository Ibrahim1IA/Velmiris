"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import {
  resolveCartLines,
  cartTotals,
  type ResolvedLine,
} from "@/lib/cart-helpers";

export default function PanierPage() {
  const t = useTranslations("cart");
  const lines = useCart((s) => s.lines);
  const removeLine = useCart((s) => s.removeLine);
  const updateQty = useCart((s) => s.updateQty);
  const clear = useCart((s) => s.clear);
  const [resolved, setResolved] = useState<ResolvedLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load of cart
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
  }, [lines, hydrated]);

  const { totalXof, totalEur, count } = cartTotals(resolved);

  if (!hydrated || loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-center text-sm text-ink/50">Chargement…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="font-serif text-3xl">{t("title")}</h1>
        <p className="mt-4 text-ink/60">{t("empty")}</p>
        <Link
          href="/boutique"
          className="mt-6 inline-block rounded-full bg-ink px-8 py-3 text-sm text-cream hover:bg-accent"
        >
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
          {t("title")} ({count})
        </h1>
        <button
          onClick={clear}
          className="text-sm text-ink/50 hover:text-accent"
        >
          {t("clear")}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
        <ul className="flex flex-col gap-6">
          {resolved.map((r) =>
            r.kind === "product" ? (
              <li
                key={`p-${r.index}`}
                className="flex gap-4 rounded-2xl border border-sand bg-cream p-4"
              >
                <div
                  className="h-24 w-20 shrink-0 rounded-xl"
                  style={{ backgroundColor: r.variant.hex }}
                  aria-hidden
                />
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/boutique/${r.product.slug.current}?variant=${r.variant._key}`}
                    className="text-sm font-medium hover:text-accent"
                  >
                    {r.product.title}
                  </Link>
                  <p className="text-sm text-ink/60">
                    {r.variant.colorName}
                  </p>
                  <p className="mt-1 text-sm">
                    {formatPrice(r.product.priceXof, "XOF")}{" "}
                    <span className="text-xs text-ink/50">
                      {formatPrice(r.product.priceEur, "EUR")}
                    </span>
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => updateQty(r.index, r.qty - 1)}
                      className="h-7 w-7 rounded-full border border-ink/15 hover:border-ink"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm">
                      {r.qty}
                    </span>
                    <button
                      onClick={() => updateQty(r.index, r.qty + 1)}
                      className="h-7 w-7 rounded-full border border-ink/15 hover:border-ink"
                      aria-label="Augmenter"
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
                <p className="hidden text-sm font-medium md:block">
                  {formatPrice(r.product.priceXof * r.qty, "XOF")}
                </p>
              </li>
            ) : (
              <li
                key={`b-${r.index}`}
                className="rounded-2xl border border-sand bg-sand/30 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-serif text-lg">
                    {t("boxCount", { n: r.index + 1 })}
                  </p>
                  <button
                    onClick={() => removeLine(r.index)}
                    className="text-xs text-ink/50 hover:text-accent"
                  >
                    {t("remove")}
                  </button>
                </div>
                <ul className="mt-3 flex flex-col gap-2">
                  {r.items.map((it, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <span
                        className="h-6 w-6 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: it.variant.hex }}
                        aria-hidden
                      />
                      <span className="flex-1">
                        {it.product.title} — {it.variant.colorName} ×{it.qty}
                      </span>
                      <span className="text-ink/60">
                        {formatPrice(it.product.priceXof, "XOF")}
                      </span>
                    </li>
                  ))}
                </ul>
                {r.giftMessage && (
                  <p className="mt-3 rounded-xl bg-cream p-3 text-sm italic">
                    {t("giftMessage")}: “{r.giftMessage}”
                  </p>
                )}
                <p className="mt-3 text-right text-sm font-medium">
                  {formatPrice(r.subtotalXof, "XOF")}
                </p>
                <Link
                  href="/box"
                  className="mt-3 inline-block text-xs underline-offset-4 hover:underline"
                >
                  Modifier la box
                </Link>
              </li>
            ),
          )}
        </ul>

        <aside className="h-fit rounded-2xl border border-sand bg-cream p-6 lg:sticky lg:top-24">
          <h2 className="font-serif text-xl">Récapitulatif</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">{t("subtotal")}</dt>
              <dd className="font-medium">{formatPrice(totalXof, "XOF")}</dd>
            </div>
            <div className="flex justify-between text-xs text-ink/50">
              <dt />
              <dd>{formatPrice(totalEur, "EUR")}</dd>
            </div>
            <div className="flex justify-between border-t border-sand pt-3 text-base font-medium">
              <dt>{t("total")}</dt>
              <dd>{formatPrice(totalXof, "XOF")}</dd>
            </div>
          </dl>
          <CheckoutForm totalXof={totalXof} totalEur={totalEur} />
          <Link
            href="/boutique"
            className="mt-4 block w-full rounded-full border border-ink/15 py-3 text-center text-sm hover:border-ink"
          >
            {t("continueShopping")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
