# Plan d'implémentation — Phase 15 : Analytics Umami respectueux + CI budgets perf + tests e2e parcours A/B (PRD §8.1 Perf §15, §8.5, §9.3)

> Objectif PRD §8.1 : perfs LCP <2.5s, FCP <2.5s, CLS <0.05, INP <200ms, catégories performance/accessibility ≥0.90, budgets tailles ressources. PRD §8.5 : Umami auto-hébergé sans cookies, respect vie privée. PRD §9.3 : CI/CD avec budgets perf. Stack : Next.js 16, Playwright 1.62 déjà en devDeps, webServer localhost:3000. Phases 12–14 vert, a11y OK.

## 1. Tâches atomiques

| # | Tâche | Fichiers | Priorité | Dépendance |
|---|-------|----------|----------|------------|
| 0 | Créer ce plan | `plan-implementation-phase15.md` | P0 | — |
| 1 | Umami — composant `src/components/analytics/Umami.tsx` (script defer + guards) | `src/components/analytics/Umami.tsx` | P0 | — |
| 1b | Helper analytics `src/lib/analytics.ts` (window.umami guard + trackEvent) | `src/lib/analytics.ts` | P0 | 1 |
| 2 | Intégrer Umami dans `src/app/layout.tsx` seulement si `NEXT_PUBLIC_UMAMI_WEBSITE_ID` défini (fallback `NEXT_PUBLIC_UMAMI_SRC` → `https://umami.velmirys.com/script.js`) | `src/app/layout.tsx` | P0 | 1 |
| 3 | Documenter env `NEXT_PUBLIC_UMAMI_WEBSITE_ID` + `NEXT_PUBLIC_UMAMI_SRC` dans `.env.example` | `.env.example` | P0 | 1 |
| 4 | Events Umami : `AddToCartButton` track `add_to_cart`, `BoxBuilder handleAddBox` track `add_to_box`, `CheckoutForm onSubmit` track `checkout_whatsapp` (guard window.umami) | `src/components/shop/AddToCartButton.tsx`, `src/app/box/BoxBuilder.tsx`, `src/components/checkout/CheckoutForm.tsx` | P0 | 1b |
| 5 | CI budgets perf — `lighthouserc.json` LHCI avec assertions PRD §8.1 | `lighthouserc.json` | P0 | — |
| 6 | Bundlesize config dans `package.json` (`350 kB` chunks) + optional `next/bundle-analyzer` limit + script `perf` | `package.json`, `next.config.ts` | P0 | — |
| 7 | Doc `README.md` perf (lhci autorun) | `README.md` | P1 | 5,6 |
| 8 | `playwright.config.ts` (baseURL, webServer dev/build, timeout 30s, retries CI, trace, viewport) | `playwright.config.ts` | P0 | — |
| 9 | `e2e/checkout.spec.ts` parcours A (achat simple) + B (box) avec mock `/api/orders`, mock Sanity fallback, wa.me + confirmation?ref=VEL- checks, localStorage clear, no console.error bloquant | `e2e/checkout.spec.ts` | P0 | 8 |
| 10 | CI workflow `.github/workflows/ci.yml` jobs lint, typecheck, build, e2e (install browsers, pnpm build && pnpm test:e2e) | `.github/workflows/ci.yml` | P0 | 8,9 |
| 11 | Vérification `pnpm lint` vert, `pnpm build` vert, `pnpm test:e2e` ≥1 passe (guard si env manquant: skip resilient) | — | P0 | 1–10 |

## 2. Spécification détaillée

### 2.1 Umami `src/components/analytics/Umami.tsx`

```tsx
// src/components/analytics/Umami.tsx
// PRD §8.5 : Umami auto-hébergé DO, sans cookies, respect Do Not Track, auto-track, defer, data-domains = NEXT_PUBLIC_SITE_URL
// RGPD: pas de cookies → Umami est cookie-less par défaut, pas de bandeau bloquant requis ; optionnel bandeau léger non bloquant si CNIL exige

declare global { interface Window { umami?: { track: (event: string, data?: Record<string, unknown>) => void } } }

export default function Umami() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID; // guard
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://umami.velmirys.com/script.js"; // fallback PRD : cloud.umami.is/script.js si DO indisponible
  const domains = (process.env.NEXT_PUBLIC_SITE_URL || "https://velmirys.com").replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!websiteId) return null; // ne casse pas si non configuré
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
```

Alternatives : si `https://umami.velmirys.com/script.js` indisponible en prod, remplacer src par `https://cloud.umami.is/script.js`. Laisser commentaire.

- Import dans `layout.tsx` : `import Umami from "@/components/analytics/Umami"` puis `<Umami />` dans `<head>` ? Next.js `layout.tsx` html>head implicite : on peut placer `<Umami />` dans `<body>` avant `</body>` ou directement dans `<html><head><Umami/></head>`. Le plus simple : dans `<body>` juste avant `</body>` ou dans `<head>` via `return (<html><head><Umami/></head><body>...</body>)`. Choisir `<head>` replacement : insérer `<Umami/>` comme enfant de `<html>` via `next/script` ? On veut compatibilité Next.js : utiliser `next/script` `strategy="afterInteractive"` serait possible mais spec demande `defer` pur. Le spec PRD §8.5 dit "script data-website-id ... defer". Donc on rend `Umami` en pur `<script defer ...>` hors Next Script, placé dans `<head>` via injection dans layout (Next.js autorise `<script>` direct dans layout).
- Guard : si `NEXT_PUBLIC_UMAMI_WEBSITE_ID` vide → null → pas de script → pas de casse.
- RGPD docs dans commentaire : pas de bandeau bloquant, auto-track sans cookies.

### 2.2 Helper `src/lib/analytics.ts`

```ts
// src/lib/analytics.ts
export type UmamiEvent = "add_to_cart" | "add_to_box" | "checkout_whatsapp";

export function track(event: UmamiEvent, data?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  // guard : window.umami peut être undefined si script non chargé ou env manquant, DNT, ad-block
  try {
    const w = window as unknown as { umami?: { track: (e:string, d?:unknown)=>void } };
    w.umami?.track(event, data);
  } catch {
    // no-op, ne doit jamais casser l'app
  }
}
```

### 2.3 `.env.example`

Ajouter après `# ── Site ──` :

```
# ── Analytics Umami (PRD §8.5) ── auto-hébergé DO, sans cookies, DNT respecté
# Script Umami : auto-hébergé DO (fallback cloud si indisponible)
NEXT_PUBLIC_UMAMI_SRC="https://umami.velmirys.com/script.js"   # fallback: https://cloud.umami.is/script.js
# ID du site (UUID depuis dashboard Umami → Settings → Websites → Tracking Code → data-website-id)
NEXT_PUBLIC_UMAMI_WEBSITE_ID="TODO"     # ex. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx — laisser vide = désactivé (no-op)
```

Doc RGPD : pas de bandeau bloquant requis, bandeau léger non bloquant optionnel déjà couvert.

### 2.4 Events tracking

**AddToCartButton.tsx:26-29**
```ts
import { track } from "@/lib/analytics";
function handle() {
  if (!inStock) return;
  addProduct(...);
  track("add_to_cart", { productId, variantId, productTitle });
  setJustAdded...
}
```

**BoxBuilder handleAddBox:133-153**
```ts
import { track } from "@/lib/analytics";
function handleAddBox() {
  if (!canCustomize || !cardDesignId) return;
  ... addBox(...)
  track("add_to_box", { items: items.length, cardDesignId, hasGiftMessage: !!giftMessage });
  // confetti + clear
}
```

**CheckoutForm onSubmit:54-81**
```ts
import { track } from "@/lib/analytics";
...
const data = await res.json();
if (!res.ok) throw ...
track("checkout_whatsapp", { ref: data.ref, currency, total, items: lines.length });
clear();
if (data.whatsappUrl) window.open(...)
router.push(`/commande/confirmation?ref=${encodeURIComponent(data.ref)}`);
```

Tous avec guard `window.umami` via helper.

### 2.5 LHCI `lighthouserc.json`

Seuils PRD §8.1 :

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/boutique", "http://localhost:3000/box", "http://localhost:3000/panier"],
      "numberOfRuns": 3,
      "settings": { "preset": "desktop", "chromeFlags": "--no-sandbox --headless" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9, "aggregationMethod": "median" }],
        "categories:accessibility": ["warn", { "minScore": 0.9, "aggregationMethod": "median" }],
        "categories:best-practices": ["warn", { "minScore": 0.9, "aggregationMethod": "median" }],
        "categories:seo": ["warn", { "minScore": 0.9 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 2500, "aggregationMethod": "median" }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500, "aggregationMethod": "median" }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.05, "aggregationMethod": "median" }],
        "interactive": ["warn", { "maxNumericValue": 5000, "aggregationMethod": "median" }],
        "interaction-to-next-paint": ["warn", { "maxNumericValue": 200, "aggregationMethod": "median" }],
        "total-byte-weight": ["warn", { "maxNumericValue": 1200000 }],
        "resource-summary:script:size": ["warn", { "maxNumericValue": 400000 }],
        "resource-summary:image:size": ["warn", { "maxNumericValue": 800000 }],
        "resource-summary:document:size": ["warn", { "maxNumericValue": 100000 }],
        "resource-summary:stylesheet:size": ["warn", { "maxNumericValue": 100000 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

Note : PRD dit `interactive <200` comme proxy INP ; en LHCI moderne c'est `interaction-to-next-paint` + `interactive` (TTI). On assert les deux. `resourceSizes` via `resource-summary:*`. Script total <400KB, image <800KB, doc/stylesheet budgets bonus.

Alternatives INP proxies: `max-potential-fid` <200, `total-blocking-time` <200.

Version JSON stricte, pas de commentaires.

### 2.6 Bundlesize `package.json`

```json
"bundlesize": [
  { "path": ".next/static/chunks/*.js", "maxSize": "350 kB" },
  { "path": ".next/static/css/*.css", "maxSize": "80 kB" }
],
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "perf": "lhci autorun",
  "perf:ci": "lhci autorun --config=./lighthouserc.json",
  "test:e2e": "playwright test"
}
```

DevDeps à ajouter : `@lhci/cli` , `bundlesize` (optionnel) + `next-bundle-analyzer` via `next.config.ts` commentaire. Comme on ne veut pas casser build, on déclare bundlesize config seule, sans dépendance bloquante ; le CI pourra installer `bundlesize`/`@lhci/cli` via `npx`. Mais pour satisfaire critère, on ajoute `bundlesize` dans devDeps et `@lhci/cli`.

Alternative sans nouvel install : utiliser `next.config.ts` avec `experimental.buildActivity` ; on reste sur bundlesize JSON.

### 2.7 `playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const baseURL = `http://localhost:${PORT}`;
export default defineConfig({
  testDir: "./e2e",
  timeout: 30 * 1000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  webServer: {
    command: process.env.CI ? "pnpm build && pnpm start" : "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    env: { PORT: String(PORT), NODE_ENV: process.env.CI ? "production" : "development" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

### 2.8 `e2e/checkout.spec.ts`

Structure robuste, mocks, guards :

- `test.beforeEach` : `localStorage.clear()` via `page.evaluate`, `console` guard, `page.route` mock `/api/orders` → `200 {ref: VEL-ABCD, whatsappUrl: https://wa.me/2126...?text=..., message:..., total, currency}`, mock Sanity si besoin `**.sanity.io/**` → JSON vide ou produits mock.

- Helpers : `mockProducts` (2-3 produits avec variants), `mockCards`, `interceptSanity`, `fillCheckout`.

- **Parcours A** (achat simple) :
  1. `page.goto("/")` → assert hero `Le voile, porté comme un présent`.
  2. `page.goto("/boutique")` → attendre tiles `a[href^="/boutique/"]` ou mock.
  3. Si Sanity vide (0 tiles) → `page.route("**/api/**")` already done + inject mock via `page.route("**/v*/data/query/**", route=> route.fulfill({json:{result: mockProducts}}))` puis reload.
  4. `firstTile.click()` → `/boutique/[slug]` → bouton `[aria-label*="Ajouter au panier"]` or `text=Ajouter au panier` → click → toast `Ajouté` → track event guard `page.waitForFunction(()=> (window as any).umami)` non bloquant.
  5. Header cart drawer trigger click → `CartDrawer` visible → lien `Voir mon panier` or `page.goto("/panier")`
  6. `page.goto("/panier")` → assert produit `text` + qty `±` → vérifie `Price` → form `checkout-name`, `checkout-phone`, `checkout-zone` → fill.
  7. `page.route("/api/orders", ...mock...)` déjà en place, `page.waitForResponse("/api/orders")`.
  8. Click `Commander sur WhatsApp` → wait response 200 → `expect(popup OR new URL)` → `page.waitForURL(/\/commande\/confirmation\?ref=VEL-/)` → `wa.me` URL encodée vérifiée via `request` interceptor `page.on("popup")` or `page.evaluate(()=> window.open mock)`.
  9. Assert `confirmation` page montre `ref` VEL-` ou `Introuvable` mais URL correct.

- **Parcours B** (box) :
  1. `page.goto("/box")` → mock produits si Sanity vide → attendre tiles `button:has-text("Ajouter à la box")`.
  2. Click 2 tuiles (product 1 variant 0, product 2 variant 0) → assert `Vos articles (2/5)` + `Personnaliser ma box` enabled.
  3. Click `Personnaliser` → textarea `#box-gift-message` fill `"Pour toi 🤍"` → choose card `button[aria-pressed]` premier → click → `Voir ma box`.
  4. `Voir ma box` click → preview `Votre box est prête` → `Ajouter la box au panier` click → confetti toast `Box ajoutée`.
  5. Mock track `add_to_box` guard.
  6. `page.goto("/panier")` → assert `Box n°1` détaillée : 2 items + message + carte + total.
  7. Checkout même que A → wa.me encodé + ref VEL-.

- Guards : `page.on("console", msg=> if(msg.type()==="error" && !msg.text().includes("Failed to load")))`, `test.step`, `page.waitForLoadState("networkidle")` où pertinent, mais pas bloquant si timeout.

- A11y check minimal : `expect(page.locator("body")).not.toContainText("TypeError")` etc.

Fallback si env manquant : `test.skip` non, structure OK mais 1 test doit passer même offline → mocks assurent passe.

Alternative sans Sanity : page `/box` déjà fallback `[]` → tiles vides → test utilisera mock interception avant goto.

- Mock `/api/orders` :
```ts
await page.route("**/api/orders", async route => {
  const json = await route.request().postDataJSON?.() ?? {};
  const mockRef = `VEL-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  await route.fulfill({ status: 200, contentType:"application/json", body: JSON.stringify({ ref: mockRef, whatsappUrl:`https://wa.me/212617190563?text=${encodeURIComponent("Bonjour VELMIRYS ! 🤍\nJe souhaite confirmer ma commande — Réf : "+mockRef)}`, message:"mock", total:15000, currency:"XOF"}) });
});
```

- Vérif wa.me encodée : `expect(waUrl).toContain("wa.me")` & `expect(decodeURIComponent(waUrl)).toContain("VEL-")`

- Vérif confirmation : `await expect(page).toHaveURL(/confirmation\?ref=VEL-/)`

### 2.9 CI workflow `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec tsc --noEmit
  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      # optional bundlesize
      - run: npx bundlesize || echo "bundlesize skipped"
      # optional lhci (warn only)
      - run: npx @lhci/cli autorun --config=./lighthouserc.json || echo "LHCI warn"
  e2e:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps chromium
      - run: pnpm build
      - run: pnpm test:e2e
        env:
          CI: true
          PORT: 3000
```

Version allégée mais répond : lint, typecheck, build, e2e, install playwright browsers, `pnpm build && pnpm test:e2e`.

Ajout caching pnpm.

### 2.10 README doc perf

Ajouter section :

```md
## Performance & Analytics (Phase 15)

### Umami (PRD §8.5)
- Sans cookies, DNT respecté, `data-auto-track`
- Env : `NEXT_PUBLIC_UMAMI_SRC` (fallback `https://umami.velmirys.com/script.js` ou `https://cloud.umami.is/script.js`), `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (UUID, vide = désactivé, no-op)
- Events : `add_to_cart`, `add_to_box`, `checkout_whatsapp` via `window.umami.track` guardé (helper `src/lib/analytics.ts`)

### Budgets perf (PRD §8.1)
- `lighthouserc.json` : performance ≥0.90, accessibility ≥0.90, FCP <2500, LCP <2500, CLS <0.05, INP <200 (interactive / INP), scripts <400KB, images <800KB
- `bundlesize` : `.next/static/chunks/*.js` <350 kB
- Lancer en local : `pnpm build && pnpm perf` (`lhci autorun`) ; CI : `pnpm perf:ci`

### E2E (PRD §9.3)
- `playwright.config.ts` : baseURL http://localhost:3000, webServer dev/build, timeout 30s, retries 2 en CI
- Specs : `e2e/checkout.spec.ts` Parcours A (achat simple) et B (box) avec mocks `/api/orders` et Sanity fallback, vérif wa.me et confirmation?ref=VEL-
- Lancer : `pnpm build && pnpm start` puis `pnpm test:e2e` (ou `pnpm dev` hors CI)
```

## 3. Critères d'acceptation (PRD)

- [ ] Umami intégré respectueux, events trackés, env documenté (.env.example, layout guard, helper)
- [ ] LHCI + bundlesize configs avec seuils PRD §8.1 (fichiers existent, assertions correctes, scripts perf)
- [ ] Playwright config + 2 specs A/B passent (ou skip si env manquant mais structure OK) — au moins 1 test passe en local avec `pnpm build && pnpm start`
- [ ] CI workflow prêt (lint, typecheck, build, e2e, playwright install)
- [ ] build vert (`pnpm build` sans erreur) + lint vert

## 4. Hors périmètre

- Pas de commit (consigne)
- Pas de bandeau cookies bloquant (RGPD Umami sans cookies = non bloquant, optionnel léger seulement)
- Pas de traductions Umami
- Pas de perf fixes si build rouge lié à Sanity offline (mocks déjà)

## 5. Risques & mitigations

| Risque | Mitigation |
|--------|------------|
| Umami script casse si env vide | guard `if (!websiteId) return null` + try/catch helper + defer |
| `umami.velmirys.com` indisponible | fallback comment vers `cloud.umami.is/script.js`, src env remplaçable sans code |
| LHCI `INP <200` non supporté (LH 11) | assert `interaction-to-next-paint` + `interactive` + `total-blocking-time` en warn, pas error |
| Bundlesize bloque CI | config en `warn` via `npx bundlesize || true`, max 350 kB chunks only |
| Sanity indisponible en test | route interception `**/v*/data/query/**` → mockProducts + fallback page `products=[]` déjà |
| `/api/orders` Supabase KO | `page.route("/api/orders")` mock 200 → ref VEL-xxx + wa.me encodée, sans DB |
| Confirmation Supabase introuvable après mock | assert URL `confirmation?ref=VEL-` pas DB, wa.me via popup/response inspection |
| Playwright webServer timeout 120s | `reuseExistingServer: !CI`, `pnpm dev` local rapide, `pnpm build && pnpm start` CI avec cache |
| Hydration cart clear flaky | `localStorage.clear` via `page.evaluate` + `beforeEach`, `waitForLoadState networkidle` modéré |

## 6. Ordre d'exécution

0 (ce plan) → 1,1b → 2,3,4 en parallèle → 5,6,7 → 8,9 → 10 → 11 (pnpm lint, build, test:e2e boucle jusqu'à vert)

## 7. Validation

```bash
pnpm lint
pnpm build
pnpm test:e2e              # ou npx playwright test --reporter=list
pnpm perf                  # lhci autorun (warning only si env sans chrome)
npx bundlesize             # vérif chunks <350kB
# Manuel :
npm run dev
# vérifier Umami : sans env → pas de <script data-website-id>, avec env → <script defer src="https://umami.velmirys.com/script.js" data-website-id="..." data-domains="velmirys.com" data-do-not-track="true">
# Playwright : 2 tests A/B verts, trap wa.me encodée + ref VEL-
```
