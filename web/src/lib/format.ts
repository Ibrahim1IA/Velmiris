import type { Currency } from "./types";

// Formatage des prix — PRD §6.2 : espace insécable comme séparateur de milliers
export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency, // XOF → « FCFA » en fr-FR ; EUR → « € » ; GNF → « GNF »
    maximumFractionDigits: currency === "EUR" ? 2 : 0,
  }).format(amount);
}
