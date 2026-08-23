# Plan d'implémentation — Phase 13 : SEO technique (PRD §8.3)

> Objectif PRD §8.3 (trafic réseaux sociaux d'abord) : metadata complètes par page, OG dynamiques produits, sitemap + robots, JSON-LD Product enrichi + Organization + BreadcrumbList, URLs propres & canonical, pas de blog V1. Stack Next.js 16 App Router, metadata API, next-sanity, next-intl.

## 1. Tâches atomiques

| # | Tâche | Fichiers | Priorité | Dépendance |
|---|-------|----------|----------|------------|
| 0 | Créer ce plan (`plan-implementation-phase13.md`) | `plan-implementation-phase13.md` | P0 | — |
| 1 | Helper central `siteUrl` + `getSiteUrl()` (NEXT_PUBLIC_SITE_URL fallback `https://velmirys.com`, trim slash) | `web/src/lib/site.ts` | P0 | — |
| 2 | `sitemap.ts` — URLs statiques + slugs Sanity (try/catch), `changeFrequency`/`priority` adaptés, `lastModified` | `web/src/app/sitemap.ts` | P0 | 1 |
| 3 | `robots.ts` — allow all, `sitemap:` ref, `disallow: /admin,/studio,/api` | `web/src/app/robots.ts` | P0 | 1 |
| 4 | OG dynamique produit `1200×630` via `next/og` ImageResponse, fallback hex si Sanity down | `web/src/app/boutique/[slug]/opengraph-image.tsx` | P0 | 1 |
| 5 | OG générique boutique `1200×630` | `web/src/app/boutique/opengraph-image.tsx` | P1 | — |
| 6 | OG générique home `1200×630` | `web/src/app/opengraph-image.tsx` | P1 | — |
| 7 | `manifest.ts` — PWA minimal (name, icons, theme_color ink, background cream) | `web/src/app/manifest.ts` | P2 | 1 |
| 8 | Refacto `panier/page.tsx` → server wrapper + client (`PanierClient.tsx`) pour autoriser `generateMetadata` | `web/src/app/panier/page.tsx`, `web/src/app/panier/PanierClient.tsx` | P0 | — |
| 9 | `layout.tsx` — `metadataBase`, title template, `openGraph`, `twitter`, `robots`, `alternates.canonical`, JSON-LD `Organization` | `web/src/app/layout.tsx` | P0 | 1 |
| 10 | Améliorer `generateMetadata` : `boutique/[slug]` (OG images, twitter, canonical variant-aware, alternates) | `web/src/app/boutique/[slug]/page.tsx` | P0 | 1,4 |
| 11 | Améliorer `generateMetadata` : `boutique`, `box`, `a-propos`, `contact`, `legal/**`, `panier`, `page.tsx` (home) | 7 fichiers | P0 | 1,5,6 |
| 12 | Enrichir JSON-LD `Product` (image, brand, offers XOF+EUR, url, sku) + `BreadcrumbList` par page | `web/src/app/boutique/[slug]/page.tsx` + autres | P0 | 1 |
| 13 | Vérifier build vert + lint + curl manuel sitemap/robots/og | `pnpm build` ; `pnpm lint` ; dev + curl | P0 | 2–12 |

## 2. Spécification détaillée

### 2.1 `src/lib/site.ts`
```ts
export const FALLBACK_SITE_URL = "https://velmirys.com";
export function getSiteUrl(): string { return (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/$/, ""); }
```
Utilisé partout. Pas de trailing slash dans canonical. Domaine configuré via `.env.example` → `NEXT_PUBLIC_SITE_URL`.

### 2.2 `src/app/sitemap.ts`
- `import type { MetadataRoute } from "next"`
- `export default async function sitemap(): Promise<MetadataRoute.Sitemap>`
- Statiques : `""`, `/boutique`, `/box`, `/a-propos`, `/contact`, `/panier`, `/legal/cgv`, `/legal/confidentialite`, `/legal/livraison-retours` → `lastModified: new Date()`.
- Dynamiques : `*[_type == "product" && defined(slug.current)]{ slug, _updatedAt }` via `client.fetch` dans `try/catch` → sinon fallback statiques seules. Map → `{ url: ${siteUrl}/boutique/${slug}, lastModified: _updatedAt ?? now, changeFrequency, priority }`.
- `changeFrequency`/`priority` :
  - `/` : `daily` / 1.0
  - `/boutique` : `daily` / 0.9
  - `/boutique/[slug]` : `weekly` / 0.8
  - `/box` : `weekly` / 0.8
  - `/a-propos`, `/contact` : `monthly` / 0.5
  - `/legal/*` : `yearly` / 0.3
  - `/panier` : `weekly` / 0.2 (noindex mais listé)
- Pas de `trailingSlash`. Si `NEXT_PUBLIC_SANITY_PROJECT_ID === TODO_PROJECT_ID` → catch → sitemap statique seule (build ne casse pas).

### 2.3 `src/app/robots.ts`
```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/studio", "/api"] },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
```
Pas de `host`. Next mappe vers `/robots.txt`.

### 2.4 OG dynamiques (`next/og` `ImageResponse`)
- **Produit** `src/app/boutique/[slug]/opengraph-image.tsx` : `export const runtime = "edge"`, `export const alt/size/contentType`.
  `export default async function Image({ params }: { params: Promise<{slug:string}> })`.
  - Fetch : `*[_type == "product" && slug.current == $slug][0]{ title, priceXof, priceEur, variants[0]{ colorName, hex, images[0] } }` + `try/catch`.
  - Si indisponible → fallback : titre = slug humanisé, hex `#F3EDE4`, prix `—`.
  - Design 1200×630 : fond `cream #FAF7F2` (`--color-cream`), carte `1200×630` flex : gauche `630×630` bloc couleur `hex` ou `img` Sanity CDN (via `urlFor` → `width 800 height 800`), droite : logo `VELMIRYS` (tracking 0.3em, serif Fraunces), titre produit 48px bold ink, `colorName` 20px ink/60, prix ligne `formatPrice` XOF + EUR secondaire, footer `velmirys.com`. Bord `sand`. Utilise `ImageResponse` avec `width:1200 height:630`. Pas de font custom (edge safe) – fallback system serif/sans.
  - Important pour partages WhatsApp/Instagram (PRD §8.3).
- **Boutique** `src/app/boutique/opengraph-image.tsx` : même structure, statique "Boutique — VELMIRYS", subtitle boutique, layout cream, sans fetch.
- **Home** `src/app/opengraph-image.tsx` : "Le voile, porté comme un présent.", baseline hero, CTA ghost, même DA.

### 2.5 `src/app/manifest.ts`
- `export default function manifest(): MetadataRoute.Manifest` → `{ name: "VELMIRYS", short_name:"VELMIRYS", description: same as layout, start_url:"/", display:"standalone", background_color:"#FAF7F2", theme_color:"#1C1917", icons:[{src:"/favicon.ico", sizes:"any", type:"image/x-icon"}] }` – PWA minimal, sans SW.

### 2.6 `src/app/layout.tsx`
- `metadataBase: new URL(getSiteUrl())`
- `title.default/template` inchangés
- Ajout `description` inchangée + `keywords`, `authors:[{name:"VELMIRYS"}]`, `creator:"VELMIRYS"`
- `alternates: { canonical: "/" }` (chaque page override)
- `openGraph: { type:"website", locale:"fr_FR", url:getSiteUrl(), siteName:"VELMIRYS", title:{...}, description, images:[{url:"/opengraph-image", width:1200, height:630, alt:"VELMIRYS — Le voile, porté comme un présent."}] }`
- `twitter: { card:"summary_large_image", title, description, images:["/opengraph-image"] }`
- `robots: { index:true, follow:true, googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1} }`
- `icons: { icon:"/favicon.ico" }`
- JSON-LD `Organization` inline `<script type="application/ld+json">` dans `<head>` ? via `dangerouslySetInnerHTML` dans layout body : `{ "@context":"https://schema.org", "@type":"Organization", name:"VELMIRYS", url:getSiteUrl(), logo:`${siteUrl}/favicon.ico`, sameAs:[] }` + `WebSite` avec `inLanguage:fr-FR`.

### 2.7 `generateMetadata` par page (patron commun)
Toutes les pages server :
```ts
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
const siteUrl = getSiteUrl();
const canonical = `${siteUrl}${path}`; // sans trailing slash, /boutique/[slug] → encode slug
return {
  title: "...",
  description: "...slice 0,160",
  alternates: { canonical },
  openGraph: { title, description, url: canonical, siteName:"VELMIRYS", locale:"fr_FR", type: typePerPage, images:[{url: ogUrl, width:1200,height:630,alt}] },
  twitter: { card:"summary_large_image", title, description, images:[ogUrl] },
  robots: pageNoIndex ? { index:false,follow:true } : undefined, // panier, confirmation
};
```
Détails par route :
- **`boutique/[slug]/page.tsx`** : fetch `title, description, priceXof, priceEur, variants[0].colorName`. `ogUrl = ${siteUrl}/boutique/${slug}/opengraph-image` (Next génère automatiquement, mais on explicite pour metadata). Si `variant` query est présent, canonical = `/boutique/${slug}` sans query (clean URL, variant = état UI). `openGraph.type="product"`.
- **`boutique/page.tsx`** : `ogUrl=/boutique/opengraph-image`, `canonical=/boutique`, `type=website`.
- **`box/page.tsx`** : title "Composer votre box — VELMIRYS", fallback og `/opengraph-image`, `canonical=/box`.
- **`a-propos/page.tsx`** : `canonical=/a-propos`, `type=article`.
- **`contact/page.tsx`** : `canonical=/contact`.
- **`legal/**/page.tsx`** : chacune son `canonical` `/legal/cgv` etc., description déjà présente (160 car.).
- **`page.tsx` (home)** : `canonical=/`, `type=website`, `images:[/opengraph-image]`.
- **`panier/page.tsx`** (après refacto) : `robots:{index:false,follow:false}`, `canonical=/panier`, `title:"Panier — VELMIRYS"`.

`next.config.ts` : s'assurer `images.remotePatterns` déjà OK. Pas besoin `trailingSlash`.

### 2.8 JSON-LD
- **`Product`** (fiche) – enrichi vs existant `boutique/[slug]/page.tsx:218-239` :
  ```json
  {
    "@context":"https://schema.org","@type":"Product",
    "name":"${title} — ${colorName}",
    "description": "...",
    "category": "...",
    "brand":{"@type":"Brand","name":"VELMIRYS"},
    "sku": "...",
    "image": ["https://cdn.sanity.io/..."] // ou []
    "url": "${siteUrl}/boutique/${slug}",
    "offers": [
      {"@type":"Offer","price":priceXof,"priceCurrency":"XOF","availability":"https://schema.org/InStock|OutOfStock","url":"${siteUrl}/boutique/${slug}","priceValidUntil":"2027-12-31","seller":{"@type":"Organization","name":"VELMIRYS"}},
      {"@type":"Offer","price":priceEur,"priceCurrency":"EUR","availability": "...", ...}
    ]
  }
  ```
  Si 1 seule devise souhaitée, ne garder que XOF (primary) pour éviter duplicate. On inclut les 2 offers (XOF primary, EUR secondary) – valide Schema.org (array offers).
- **`BreadcrumbList`** (produit) : `Home` → `Boutique` → `Product.title` (3 items). Idem boutique (2 items), a-propos/contact/legal/box/panier (2 items).
- **`Organization`** global dans `layout.tsx` (voir 2.6). Pas de duplicate Product sur listing.

### 2.9 Panier refacto
- Extraire `web/src/app/panier/PanierClient.tsx` = contenu actuel `"use client"` de `page.tsx` (sans `export metadata`).
- `web/src/app/panier/page.tsx` devient server :
  ```ts
  import type { Metadata } from "next";
  import PanierClient from "./PanierClient";
  import { getSiteUrl } from "@/lib/site";
  export const metadata: Metadata = { title:"Panier — VELMIRYS", description:"...", alternates:{canonical:`${getSiteUrl()}/panier`}, robots:{index:false,follow:false}, openGraph:{...}, twitter:{...} };
  export default function Page(){ return <PanierClient/> }
  ```
  Garantit build OK et SEO noindex (panier non indexable).

### 2.10 Vérifications
- `pnpm build` vert (ISR sitemap/og edge OK, pas de `TODO_PROJECT_ID` crash).
- `pnpm lint` 0 error bloquant (`react-hooks/set-state-in-effect` déjà fix, edge OG sans hook).
- Manuel (dev) : `curl -I http://localhost:3000/sitemap.xml` → 200 xml ; `/robots.txt` → 200 avec `Sitemap:` ; `/boutique/<slug>/opengraph-image` → 200 image/png 1200×630 ; `/opengraph-image` et `/boutique/opengraph-image` → 200 ; view-source vérifier `<meta property="og:image">`, `<link rel="canonical">`, `<script type="application/ld+json">` Product/Organization/Breadcrumb.

## 3. Critères d'acceptation (PRD §8.3)
- [ ] `sitemap.xml` liste statiques + slugs Sanity (fallback si Sanity down) – `GET /sitemap.xml` 200 valid XML
- [ ] `robots.txt` correct – `Allow:/` + `Disallow:/admin,/studio,/api` + `Sitemap: https://.../sitemap.xml`
- [ ] OG dynamiques produits `1200×630` fonctionnelles – `GET /boutique/<slug>/opengraph-image` 200 + visuel hex/prix
- [ ] OG génériques home + boutique fonctionnelles
- [ ] `metadata` complètes (title template, description 160, openGraph, twitter, canonical) sur toutes les pages
- [ ] JSON-LD `Product` enrichi (brand, image, 2 offers, availability) + `Organization` global + `BreadcrumbList`
- [ ] Canonical URLs propres (pas de trailing slash ambigu, variant query exclue)
- [ ] `manifest.ts` (PWA minimal) – `GET /manifest.webmanifest` 200
- [ ] `build` vert + `lint` sans bloquant
- [ ] Pas de blog V1 (vérifié – aucune route `/journal`)

## 4. Hors périmètre
- Pas de commit.
- Pas de blog/journal, pas de hreflang EN (i18n-ready FR seul).
- Pas de `schema Article` blog, pas de `next-sitemap` lib.
- OG : pas de font custom edge (system serif) – améliorable en V2 avec `fetch(new URL(..., import.meta.url))`.

## 5. Risques & mitigations
| Risque | Mitigation |
|--------|------------|
| `TODO_PROJECT_ID` → `client.fetch` throw dans `sitemap`/`og` | `try/catch` + fallback arrays vides / placeholder, build ne casse pas |
| `opengraph-image.tsx` edge + Sanity CDN indisponible | Fallback hex + texte seul, pas de fetch image externe bloquant |
| `panier` `"use client"` bloque `metadata` | Refacto server wrapper + client component |
| `ImageResponse` font manquante | System fonts only, `width/height` explicites |
| Canonical double `/` | `replace(/\/$/,"")` centralisé dans `getSiteUrl()` |

## 6. Ordre d'exécution
0 (ce plan) → 1 → 8 → 2,3,4,5,6,7 en parallèle → 9 → 10,11,12 → 13 (build/lint/curl).

## 7. Validation
```bash
pnpm build
pnpm lint
pnpm dev # puis
curl -I http://localhost:3000/sitemap.xml
curl -I http://localhost:3000/robots.txt
curl -I http://localhost:3000/opengraph-image
curl -I http://localhost:3000/boutique/opengraph-image
curl -I http://localhost:3000/boutique/<slug>/opengraph-image
```
