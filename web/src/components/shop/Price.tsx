"use client";

import { useCurrency } from "@/store/currency";
import { formatPrice } from "@/lib/format";

interface Props {
  priceXof: number;
  priceEur: number;
  className?: string;
  secondaryClassName?: string;
  showSecondary?: boolean;
}

export default function Price({
  priceXof,
  priceEur,
  className,
  secondaryClassName = "text-xs text-ink/60",
  showSecondary = true,
}: Props) {
  const currency = useCurrency((s) => s.currency);
  const hydrated = useCurrency((s) => s.hydrated);

  // SSR fallback : FCFA primaire
  if (!hydrated) {
    return (
      <span className={className}>
        {formatPrice(priceXof, "XOF")}
        {showSecondary && <span className={secondaryClassName}> {formatPrice(priceEur, "EUR")}</span>}
      </span>
    );
  }

  const primary = currency === "XOF" ? formatPrice(priceXof, "XOF") : formatPrice(priceEur, "EUR");
  const secondary = currency === "XOF" ? formatPrice(priceEur, "EUR") : formatPrice(priceXof, "XOF");

  return (
    <span>
      <span className={className}>{primary}</span>
      {showSecondary && <span className={secondaryClassName}> {secondary}</span>}
    </span>
  );
}

export function PricePrimary({ priceXof, priceEur, className }: { priceXof: number; priceEur: number; className?: string }) {
  const currency = useCurrency((s) => s.currency);
  const hydrated = useCurrency((s) => s.hydrated);
  if (!hydrated) return <span className={className}>{formatPrice(priceXof, "XOF")}</span>;
  return <span className={className}>{formatPrice(currency === "XOF" ? priceXof : priceEur, currency)}</span>;
}
