This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Performance & Analytics — Phase 15 (PRD §8.1, §8.5, §9.3)

### Umami (PRD §8.5) — sans cookies, respect DNT
- Script `defer` auto-hébergé DigitalOcean : `NEXT_PUBLIC_UMAMI_SRC` (fallback `https://umami.velmirys.com/script.js` ou `https://cloud.umami.is/script.js` si DO indisponible)
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` : UUID du site (vide = analytics désactivé, no-op — le site ne casse jamais)
- `data-domains` = `NEXT_PUBLIC_SITE_URL` (sans protocole), `data-do-not-track="true"`, `data-auto-track="true"`, `data-cache="true"`
- Composant : `src/components/analytics/Umami.tsx` (guard si `WEBSITE_ID` vide) intégré dans `src/app/layout.tsx` (`<head><Umami/></head>`)
- RGPD : Umami est cookie-less → pas de bandeau bloquant requis (bandeau léger non bloquant optionnel)
- Events : `umami.track("add_to_cart")` dans `AddToCartButton`, `umami.track("add_to_box")` dans `BoxBuilder handleAddBox`, `umami.track("checkout_whatsapp")` dans `CheckoutForm onSubmit` via helper `src/lib/analytics.ts` (`window.umami?.track` guardé)

### Budgets perf (PRD §8.1 §15)
- `lighthouserc.json` (LHCI) : `categories:performance ≥0.90`, `accessibility ≥0.90`, `first-contentful-paint <2500`, `largest-contentful-paint <2500`, `cumulative-layout-shift <0.05`, `interactive <5000` + `interaction-to-next-paint <200` + `total-blocking-time <200` + `max-potential-fid <200` (proxies INP <200), budgets `resource-summary:script <400KB`, `image <800KB`, `document <100KB`, `stylesheet <100KB`, `total-byte-weight <1.2MB`, 3 runs median desktop
- `bundlesize` dans `package.json` : `.next/static/chunks/*.js <350 kB`, `.next/static/css/*.css <80 kB`
- Scripts : `pnpm perf` (`lhci autorun`) et `pnpm perf:ci` (`lhci autorun --config=./lighthouserc.json`)
- CI : `npx bundlesize || warn` + `npx @lhci/cli autorun || warn` (warn only, n’empêche pas le build)

### E2E Playwright — parcours A/B (PRD §9.3)
- Config : `playwright.config.ts` — `baseURL http://localhost:3000`, `webServer` `pnpm dev` (local) / `pnpm build && pnpm start` (CI), `timeout 30s`, `retries 2` en CI, `trace on-first-retry`
- Specs : `e2e/checkout.spec.ts` — Parcours A (achat simple : `/` → `/boutique` → tuile → `/boutique/[slug]` add to cart → drawer → `/panier` → formulaire → mock `/api/orders` → `wa.me` encodée + `confirmation?ref=VEL-`) et Parcours B (box : `/box` 2 articles → personnalise message + carte → preview → add to cart → `/panier` Box n°1 détaillée → checkout) ; `localStorage.clear()` beforeEach, `networkidle` modéré, `console.error` guard, mocks Sanity `*sanity.io/**` + `**/api/orders` pour passer offline (Supabase/Sanity indisponibles → fallback injection `localStorage` zustand `velmirys-cart` / `velmirys-box-draft`)
- Lancer : `pnpm build && pnpm start` (CI) ou `pnpm dev` hors CI, puis `pnpm test:e2e` (`playwright test --reporter=list`)

### CI budgets perf (PRD §9.3)
- Workflow `.github/workflows/ci.yml` : jobs `lint` (`pnpm lint`), `typecheck` (`tsc --noEmit`), `build` (`pnpm build` + `bundlesize` + `lhci`), `e2e` (`playwright install --with-deps chromium` + `pnpm build && pnpm test:e2e`) — cache pnpm, Node 20

## Déploiement Docker (Droplet)

```bash
# À la racine du repo
cp .env.example .env   # remplir les valeurs
docker compose up -d   # build automatique au premier lancement
docker compose logs -f web
```

- ⚠️ Arrêter tout serveur local sur le port 3000 (`pnpm dev`) avant `docker compose up -d` — le conteneur publie le port 3000.
- Les `NEXT_PUBLIC_*` sont inlinées au build : après modification du `.env`, relancer `docker compose up -d --build`.
- Les secrets ne sont jamais committés (`.env` est gitignoré) ; seule la liste des variables est dans `.env.example`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
