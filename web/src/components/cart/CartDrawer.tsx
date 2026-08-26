"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/cart";
import { useCurrency } from "@/store/currency";
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
  const currency = useCurrency((s) => s.currency);
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

  const { totalXof, totalEur } = cartTotals(resolved);
  const total = currency === "XOF" ? totalXof : totalEur;
  const count = lines.reduce(
    (acc, l) => (l.kind === "product" ? acc + l.qty : acc + l.items.reduce((s, it) => s + it.qty, 0)),
    0,
  );
  const [mounted, setMounted] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal mount guard
  useEffect(() => setMounted(true), []);

  // lock scroll when open + focus management (WCAG 2.1)
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      // Focus premier élément focusable dans le drawer
      requestAnimationFrame(() => {
        const aside = asideRef.current;
        if (!aside) return;
        const focusable = aside.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0] ?? aside;
        (first as HTMLElement).focus();
      });
    } else {
      document.body.style.overflow = "";
      // restore focus
      if (previouslyFocused.current) {
        previouslyFocused.current.focus();
        previouslyFocused.current = null;
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Esc close + focus trap
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const aside = asideRef.current;
        if (!aside) return;
        const focusable = Array.from(
          aside.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Portal + animation : évite le bug fixed-in-backdrop-filter du header (z-50 backdrop-blur)
  // et permet le déroulé translate-x
  if (!mounted) return null;

  const overlay = (
    <div
      className={`fixed inset-0 z-[60] flex justify-end ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        aria-label="Fermer le panier — Échap"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 focus-visible:outline-none ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("drawerTitle")}
        aria-labelledby="cart-drawer-title"
        className={`relative flex h-full w-full max-w-md flex-col bg-cream shadow-xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-sand px-6 py-4">
          <h2 id="cart-drawer-title" className="font-serif text-xl">
            {t("drawerTitle")} ({count})
          </h2>
          <button
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            aria-label="Fermer le panier"
          >
            <span aria-hidden>✕</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-ink/60">{t("empty")}</p>
              <Link
                href="/boutique"
                prefetch
                onClick={onClose}
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-6 py-2 text-sm text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {t("emptyCta")}
              </Link>
            </div>
          ) : loading ? (
            <p className="py-8 text-center text-sm text-ink/60" role="status" aria-live="polite">
              Chargement…
            </p>
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
                        className="rounded-sm text-sm font-medium hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {r.product.title}
                      </Link>
                      <p className="text-sm text-ink/60">
                        {r.variant.colorName}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {formatPrice(currency === "XOF" ? r.product.priceXof : r.product.priceEur, currency)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQty(r.index, r.qty - 1)}
                          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ink/15 text-sm hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          aria-label={`Diminuer quantité de ${r.product.title}`}
                        >
                          <span aria-hidden>−</span>
                        </button>
                        <span className="min-w-6 text-center text-sm" aria-live="polite" aria-atomic="true">
                          {r.qty}
                        </span>
                        <button
                          onClick={() => updateQty(r.index, r.qty + 1)}
                          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ink/15 text-sm hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          aria-label={`Augmenter quantité de ${r.product.title}`}
                        >
                          <span aria-hidden>+</span>
                        </button>
                        <button
                          onClick={() => removeLine(r.index)}
                          className="ml-auto inline-flex min-h-[44px] items-center rounded-full px-3 text-xs text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          aria-label={`Retirer ${r.product.title} — ${r.variant.colorName} du panier`}
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
                      {formatPrice(currency === "XOF" ? r.subtotalXof : r.subtotalEur, currency)}
                    </p>
                    <button
                      onClick={() => removeLine(r.index)}
                      className="mt-2 inline-flex min-h-[44px] items-center rounded-full px-3 text-xs text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`Retirer Box n°${r.index + 1} du panier`}
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
                {formatPrice(total, currency)}
              </span>
            </div>
            <Link
              href="/panier"
              onClick={onClose}
              className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-full bg-ink py-3 text-center text-sm font-medium text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {t("seeCart")}
            </Link>
            <p className="mt-2 text-center text-xs text-ink/60">
              Emballage cadeau offert
            </p>
          </footer>
        )}
      </aside>
    </div>
  );

  return createPortal(overlay, document.body);
}
