import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// FR uniquement en V1, architecture i18n-ready (PRD §2 / G1)
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.pixabay.com", pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
      { protocol: "https", hostname: "pixabay.com", pathname: "/**" },
    ],
  },
  // Turbopack font loader fix: Next 16.3 Turbopack interne @vercel/turbopack-next/internal/font échoue en build
  // On garde Turbopack en dev mais build en webpack via --no-turbopack (package.json). Garde config minimale.
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default withNextIntl(nextConfig);
