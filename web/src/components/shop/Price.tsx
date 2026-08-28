"use client";

import { useCurrency } from "@/store/currency";
import { formatPrice } from "@/lib/format";

interface Props {
  priceXof: number;
  priceEur: number;
  priceGnf: number;
  className?: string;
  secondaryClassName?: string;
  showSecondary?: boolean;
}

function priceFor(currency: string, priceXof: number, priceEur: number, priceGnf: number): string {
  if (currency === "EUR") return formatPrice(priceEur, "EUR");
  if (currency === "GNF") return formatPrice(priceGnf, "GNF");
  return formatPrice(priceXof, "XOF");
}

export default function Price({
  priceXof,
  priceEur,
  priceGnf,
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

  const primary = priceFor(currency, priceXof, priceEur, priceGnf);
  // Secondaire = EUR si primaire FCFA/GNF, sinon FCFA
  const secondaryCurrency = currency === "EUR" ? "XOF" : "EUR";
  const secondary =
    secondaryCurrency === "EUR" ? formatPrice(priceEur, "EUR") : formatPrice(priceXof, "XOF");

  return (
    <span>
      <span className={className}>{primary}</span>
      {showSecondary && <span className={secondaryClassName}> {secondary}</span>}
    </span>
  );
}

export function PricePrimary({
  priceXof,
  priceEur,
  priceGnf,
  className,
}: {
  priceXof: number;
  priceEur: number;
  priceGnf: number;
  className?: string;
}) {
  const currency = useCurrency((s) => s.currency);
  const hydrated = useCurrency((s) => s.hydrated);
  if (!hydrated) return <span className={className}>{formatPrice(priceXof, "XOF")}</span>;
  return <span className={className}>{priceFor(currency, priceXof, priceEur, priceGnf)}</span>;
}
