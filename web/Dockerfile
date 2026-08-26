# web/Dockerfile — VELMIRYS Next.js 16 (pnpm) — multi-stage standalone
# Build sans CI/CD : sur le Droplet -> docker compose up -d --build
# NEXT_PUBLIC_* sont baked au build (ARG) -> rebuild nécessaire si tu changes l'IP/domaine

FROM node:22-alpine AS base
# pnpm baked dans l'image -> évite que corepack le retélécharge dans chaque stage
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

# ── deps ──
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile --fetch-retries=5

# ── builder ──
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ARGs pour les vars publiques (inlinées au build Next.js)
ARG NEXT_PUBLIC_SANITY_PROJECT_ID=1anohn14
ARG NEXT_PUBLIC_SANITY_DATASET=production
ARG NEXT_PUBLIC_SANITY_API_VERSION=2026-08-19
ARG NEXT_PUBLIC_SITE_URL=http://157.230.85.193:3000
ARG NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER=+212617190563
ARG NEXT_PUBLIC_SUPABASE_URL=https://ookubmeecvvqnnzehlam.supabase.co
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Um6ImVPItq_kJphXkSaBAw_POBVUyAM
ARG NEXT_PUBLIC_UMAMI_SRC
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID

ENV NEXT_TELEMETRY_DISABLED=1
# Fallback si build sans --build-arg (évite TODO)
ENV NEXT_PUBLIC_SANITY_PROJECT_ID=${NEXT_PUBLIC_SANITY_PROJECT_ID}
ENV NEXT_PUBLIC_SANITY_DATASET=${NEXT_PUBLIC_SANITY_DATASET}
ENV NEXT_PUBLIC_SANITY_API_VERSION=${NEXT_PUBLIC_SANITY_API_VERSION}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER=${NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}

RUN pnpm build

# ── runner (léger) ──
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output (next.config.ts: output: 'standalone')
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
