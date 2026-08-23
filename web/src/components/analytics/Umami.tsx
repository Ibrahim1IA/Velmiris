// PRD §8.5 — Umami auto-hébergé sans cookies, respect vie privée
// - defer, data-do-not-track="true", data-auto-track="true", data-cache="true"
// - data-website-id depuis NEXT_PUBLIC_UMAMI_WEBSITE_ID
// - data-domains depuis NEXT_PUBLIC_SITE_URL (sans protocole)
// - src depuis NEXT_PUBLIC_UMAMI_SRC fallback https://umami.velmirys.com/script.js
//   (fallback cloud: https://cloud.umami.is/script.js si DO indisponible)
// - RGPD: Umami est cookie-less par défaut → pas de bandeau bloquant requis
//   Bandeau léger non bloquant optionnel si CNIL l'exige (hors périmètre V1)
// Guard: si NEXT_PUBLIC_UMAMI_WEBSITE_ID vide → no-op, ne casse jamais l'app

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

export default function Umami() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) return null;

  const src =
    process.env.NEXT_PUBLIC_UMAMI_SRC || "https://umami.velmirys.com/script.js";
  // fallback cloud si DO indisponible : https://cloud.umami.is/script.js
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velmirys.com";
  const domains = rawSiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <script
      defer
      src={src}
      data-website-id={websiteId}
      data-domains={domains}
      data-do-not-track="true"
      data-auto-track="true"
      data-cache="true"
    />
  );
}
