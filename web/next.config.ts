import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// FR uniquement en V1, architecture i18n-ready (PRD §2 / G1)
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default withNextIntl(nextConfig);
