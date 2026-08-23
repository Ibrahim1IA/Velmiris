# DECISIONS — Phase 13 SEO technique (PRD §8.3)

## 2026-08-23 — Choix SEO

### 1. Domaine canonique
- `NEXT_PUBLIC_SITE_URL` avec fallback `https://velmirys.com` (centralisé `src/lib/site.ts` `getSiteUrl()` trim slash). Choix : pas de trailing slash sauf root `/` ; canonical sans query `variant` (état UI). Raison : URLs propres, pas d’ambiguïté duplicate (PRD §8.3).

### 2. Sitemap
- Inclut 8 routes statiques + `/boutique/[slug]` via `client.fetch` GROQ `*[_type=="product"]{slug,_updatedAt}` avec `try/catch` → fallback statiques seules si `TODO_PROJECT_ID` ou Sanity down. Ne casse jamais le build (PRD §13 mitigation). `changeFrequency`/`priority` adaptés : `/`=daily1.0, `/boutique`=daily0.9, produits/box=weekly0.8, a-propos/contact=monthly0.5, legal=yearly0.3, panier=weekly0.2 (listé car exigé par tâche, même si noindex).

### 3. Robots
- `Allow: /` + `Disallow: [/admin, /studio, /api]` + `Sitemap: https://velmirys.com/sitemap.xml`. Pas de `Crawl-delay`. Choix : `robots.ts` MetadataRoute, pas de `robots.txt` statique.

### 4. OG dynamiques
- `next/og` `ImageResponse` 1200×630. Runtime `edge` (deprecated warning ignoré, voir Next docs — edge reste supporté pour OG). 
- Produit : fond `hex` variant (fallback `#F3EDE4`), titre + colorName + prix XOF/EUR, logo VELMIRYS, footer `velmirys.com/boutique/[slug]`. Pas d’`<img>` externe pour fiabilité WhatsApp (évite fetch CDN qui peut fail edge). Design cream `#FAF7F2`.
- Satori constraint `display:flex` obligatoire si >1 enfant : tous les conteneurs multi-enfants ont `display:flex` explicite ; suppression `display:-webkit-box`, `position:relative`, `alignItems:baseline`, `alignSelf` non supportés. Fix : `display:flex` partout, `alignItems:center`, prix XOF fallback si manquant.
- Boutique / Home : OG génériques statiques sans fetch, réutilisables.

### 5. Metadata
- `layout.tsx` : `metadataBase: new URL(getSiteUrl())`, `title.template "%s · VELMIRYS"`, `openGraph` + `twitter` avec `/opengraph-image`, `robots` googleBot large preview, `alternates.canonical "/"`. JSON-LD `Organization` + `WebSite` in body.
- Pages avec `— VELMIRYS` déjà dans le titre (box, a-propos, contact, legal, home) : use `title:{absolute:"..."}` pour éviter duplication `· VELMIRYS` via template. Boutique/produit/panier : titre court → template OK.
- `panier` refacto : extraction `PanierClient.tsx` (`"use client"`) + `page.tsx` server wrapper avec `metadata` `robots:{index:false,follow:false}` (panier non indexable mais listé en sitemap per tâche).
- `generateMetadata` produit : `canonical` sans query variant, `ogImage` = `/boutique/[slug]/opengraph-image`, `type:website` (Next ne supporte pas `product` dans `OpenGraph` union → cast).

### 6. JSON-LD
- Produit : `Product` enrichi `brand:VELMIRYS`, `sku`, `image[]` via `urlFor`, `url`, `offers: [{XOF},{EUR}]` avec `priceValidUntil`, `availability`, `seller:Organization`. + `BreadcrumbList` Home→Boutique→Produit.
- Autres pages : `BreadcrumbList` 2 niveaux. `Organization` global dans layout.

### 7. Manifest
- `manifest.ts` minimal PWA (`name`, `short_name`, `background_color:#FAF7F2`, `theme_color:#1C1917`, `display:standalone`, `icons:[/favicon.ico]`). Pas de SW V1.

### 8. Lint
- `public/draco/**` ignoré dans `eslint.config.mjs` (assets 3D tiers, 9 erreurs `no-require-imports` préexistantes phase 12). `pnpm lint` vert après fix.
