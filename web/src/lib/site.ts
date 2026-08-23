// URL canonique du site — PRD §8.3
// Domaine via NEXT_PUBLIC_SITE_URL ou fallback https://velmirys.com
export const FALLBACK_SITE_URL = "https://velmirys.com";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
  return raw.replace(/\/$/, "");
}
