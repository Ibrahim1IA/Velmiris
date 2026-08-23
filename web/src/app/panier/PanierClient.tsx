"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/cart";
import { useCurrency } from "@/store/currency";
import { formatPrice } from "@/lib/format";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import Price from "@/components/shop/Price";
import {
  resolveCartLines,
  cartTotals,
  type ResolvedLine,
} from "@/lib/cart-helpers";

export default function PanierClient() {
  const t = useTranslations("cart");
  const lines = useCart((s) => s.lines);
  const removeLine = useCart((s) => s.removeLine);
  const updateQty = useCart((s) => s.updateQty);
  const clear = useCart((s) => s.clear);
  const currency = useCurrency((s) => s.currency);
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
        <p className="text-center text-sm text-ink/60" role="status" aria-live="polite">
          Chargement…
        </p>
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
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
          type="button"
          onClick={clear}
          className="inline-flex min-h-[44px] items-center rounded-full px-3 text-sm text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Vider le panier"
        >
          {t("clear")}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
        <ul className="flex flex-col gap-6" aria-label="Articles dans le panier">
          {resolved.map((r) =>
            r.kind === "product" ? (
              <li
                key={`p-${r.index}`}
                className="flex gap-4 rounded-2xl border border-sand bg-cream p-4"
              >
                <div
                  className="h-24 w-20 shrink-0 rounded-xl"
                  style={{ backgroundColor: r.variant.hex }}
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/boutique/${r.product.slug.current}?variant=${r.variant._key}`}
                    className="rounded-sm text-sm font-medium hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {r.product.title}
                  </Link>
                  <p className="text-sm text-ink/60">
                    {r.variant.colorName}
                  </p>
                  <p className="mt-1 text-sm">
                    <Price priceXof={r.product.priceXof} priceEur={r.product.priceEur} />
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQty(r.index, r.qty - 1)}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ink/15 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`Diminuer quantité de ${r.product.title} — ${r.variant.colorName}`}
                    >
                      <span aria-hidden>−</span>
                    </button>
                    <span className="min-w-6 text-center text-sm" aria-live="polite" aria-atomic="true">
                      {r.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(r.index, r.qty + 1)}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ink/15 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`Augmenter quantité de ${r.product.title} — ${r.variant.colorName}`}
                    >
                      <span aria-hidden>+</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLine(r.index)}
                      className="ml-auto inline-flex min-h-[44px] items-center rounded-full px-3 text-xs text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`Retirer ${r.product.title} — ${r.variant.colorName} du panier`}
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
                <p className="hidden text-sm font-medium md:block">
                  {formatPrice(currency === "XOF" ? r.product.priceXof * r.qty : r.product.priceEur * r.qty, currency)}
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
                    type="button"
                    onClick={() => removeLine(r.index)}
                    className="inline-flex min-h-[44px] items-center rounded-full px-3 text-xs text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`Retirer Box n°${r.index + 1} du panier`}
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
                        aria-hidden="true"
                      />
                      <span className="flex-1">
                        {it.product.title} — {it.variant.colorName} ×{it.qty}
                      </span>
                      <span className="text-ink/60">
                        <Price priceXof={it.product.priceXof} priceEur={it.product.priceEur} showSecondary={false} />
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
                  {formatPrice(currency === "XOF" ? r.subtotalXof : r.subtotalEur, currency)}
                </p>
                <Link
                  href="/box"
                  className="mt-3 inline-flex min-h-[44px] items-center rounded-full px-3 text-xs underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              <dd className="font-medium">{formatPrice(currency === "XOF" ? totalXof : totalEur, currency)}</dd>
            </div>
            <div className="flex justify-between text-xs text-ink/60">
              <dt />
              <dd>{formatPrice(currency === "XOF" ? totalEur : totalXof, currency === "XOF" ? "EUR" : "XOF")}</dd>
            </div>
            <div className="flex justify-between border-t border-sand pt-3 text-base font-medium">
              <dt>{t("total")}</dt>
              <dd>{formatPrice(currency === "XOF" ? totalXof : totalEur, currency)}</dd>
            </div>
          </dl>
          <CheckoutForm totalXof={totalXof} totalEur={totalEur} currency={currency} />
          <Link
            href="/boutique"
            className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-full border border-ink/15 py-3 text-center text-sm hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t("continueShopping")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
