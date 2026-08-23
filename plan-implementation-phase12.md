# Plan d'implémentation — Phase 12 : Pages éditoriales (PRD §3 / §10)

> Objectif PRD §3.1 + §10 : 5 routes manquantes `/a-propos`, `/contact`, `/legal/cgv`, `/legal/confidentialite`, `/legal/livraison-retours`. Stack Next.js 16 App Router, Tailwind, next-intl FR, tokens VELMIRYS, Sanity pageContent optionnel.

## 1. Tâches atomiques

| # | Tâche | Fichiers | Priorité | Dépendance |
|---|-------|----------|----------|------------|
| 1 | Créer `plan-implementation-phase12.md` (ce fichier) | `plan-implementation-phase12.md` | P0 | — |
| 2 | Composant partagé PortableText (fallback sans lib) | `web/src/components/sanity/SanityPortableText.tsx` | P0 | — |
| 3 | Composant bandeau légal + LegalShell | `web/src/components/legal/LegalNotice.tsx` | P0 | 2 |
| 4 | Page `/a-propos` : hero + histoire + exigence + geste + citation | `web/src/app/a-propos/page.tsx` | P0 | 2 |
| 5 | Page `/contact` : hero + CTA WhatsApp + infos Sanity + FAQ <details> + horaires | `web/src/app/contact/page.tsx` | P0 | 2 |
| 6 | Pages légales `/legal/cgv`, `/confidentialite`, `/livraison-retours` | `web/src/app/legal/**/page.tsx` | P0 | 2,3 |
| 7 | Vérifier / compléter footer liens | `web/src/components/layout/Footer.tsx` | P1 | 4-6 |
| 8 | Build + lint + test manuel 200 | `pnpm build` + curl 5 routes | P0 | 4-7 |

## 2. Spécification détaillée

### 2.1 Principes communs (toutes les 5 pages)
- `export const metadata` avec title/description FR optimisés SEO.
- `export const revalidate = 3600` si fetch Sanity.
- Fetch `pageContent` par slug avec `try/catch` → fallback hardcodé → ne jamais casser le build si Sanity indisponible (pattern boutique `src/app/boutique/page.tsx:54-63`).
- Slugs Sanity supportés : `["a-propos", "apres"]` etc. → on query `slug.current in [$slug, $alt]` pour tolérance (`cgv` / `legal-cgv` / `legal/cgv`).
- PortableText prioritaire si présent, sinon contenu hardcodé premium issu de `contenus/*.md`.
- Responsive 375/768/1440 via `max-w-6xl`, grid `grid-cols-1 md:grid-cols-2`, paddings `px-6`.
- A11y : hiérarchie h1→h2→h3, `aria-label`, `focus-visible: ring`, `details/summary` accessibles, contrasts AA.
- Pas de `TODO` visuel bloquant : placeholder stylisé `bg-sand` + texte explicite.
- Design tokens : `bg-cream`, `bg-sand`, `text-ink`, `text-accent`, `font-serif` (Fraunces) pour titres, `font-sans` (Inter) corps.

### 2.2 `/a-propos` — `src/app/a-propos/page.tsx`
- **Hero** : surtitle `VELMIRYS`, h1 `La maison VELMIRYS`, baseline « Une marque née d'une conviction : le voile mérite les plus beaux tissus… » (depuis `04-a-propos.md:8`). Fonds `bg-sand/40`, centré, CTA secondaire vers boutique.
- **Sections** :
  1. Notre histoire — 2 colonnes, placeholder image à gauche (`aspect-[4/3] bg-sand rounded-2xl` avec motif), texte à droite (frustration → création). Pas de faits inventés (pas de ville/année si non validé) — placeholder discret « Fondée à Dakar » sans date précise + note `*Histoire détaillée à venir`.
  2. L'exigence du détail — bandeau `bg-ink text-cream` 3 colonnes : Tombé / Couvrance / Tenue, icônes.
  3. Le geste — boîte blanche, papier de soie, carte : 2 colonnes inversées, citation « Nous ne vendons pas des foulards… » en serif large.
- **UX** : parallax léger via `bg-fixed` / `transform` subtil (respect `prefers-reduced-motion`), images `loading="lazy"`.

### 2.3 `/contact` — `src/app/contact/page.tsx`
- **Fetch Sanity** : `siteSettings { whatsappNumber, email, instagram, tiktok, deliveryZonesLabel }` + fallback env `NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER` et placeholders.
- **Hero** : h1 `Parlons-nous`, intro « Une question, une hésitation… sous 24h ouvrées ».
- **CTA WhatsApp principal** : bouton `bg-ink → hover:bg-accent`, href `https://wa.me/<number>?text=...` encodé. Fallback message si numéro TODO → disabled stylisé.
- **Cartes contact** : grid 2 / 3 colonnes : WhatsApp, Email (mailto), Instagram/TikTok (liens externes `rel="noopener"`). Horaires placeholder « Lun–Sam 9h–18h (GMT) — réponse sous 24h ouvrées ».
- **FAQ 7 questions** : issues de `05-faq-et-contact.md:3-24`. Rendu en `<details>` natif accessible, `summary` focusable, animation `marker` accent. Une question ouverte par défaut. Pas de JS state => pas de lint `set-state-in-effect`.
- **A11y** : FAQ `aria-labelledby`, `details` avec `open`.

### 2.4 Pages légales — `src/app/legal/**/page.tsx`
- **Commun** : `LegalNotice` bandeau amber `Bien que ces contenus soient fournis comme templates génériques — à faire valider par un professionnel avant publication (06-legales.md:3)`.
- **Structure** : header avec h1 + date mise à jour, puis sections numérotées `ol` / `h2`, tables pour tarifs (livraison).
- **CGV** (`06-legales.md:8-30`) : 7 sections (Objet, Commande, Prix, Paiement, Livraison, Rétractation, Litiges). Placeholders `[TODO]` remplacés par encarts `bg-sand rounded-xl p-4 text-sm`.
- **Confidentialité** (`06-legales.md:33-40`) : Données collectées, cookies, revente, conservation, droits. Liste à puces.
- **Livraison & retours** (`06-legales.md:43-48`) : table zones/tarifs placeholder 3 lignes (Dakar, Autres villes, International) avec `FCFA / EUR`, délais, suivi WhatsApp, retours encart.
- **Navigation inter-légales** : footer interne liens vers les 2 autres pages légales.

### 2.5 Footer
- Vérifier `src/components/layout/Footer.tsx:26-43` contient déjà `/contact`, `/legal/livraison-retours`, `/legal/cgv`, `/legal/confidentialite`. **Manque** `/a-propos` → ajouter dans bloc `Maison`/`Aide`.
- Ajouter lien `À propos` + s'assurer `hover:text-accent` + `focus-visible`.

## 3. Critères d'acceptation

- [ ] `pnpm build` vert (0 erreur, 0 ESLint error bloquant)
- [ ] 5 routes répondent 200 (test `pnpm dev` + fetch `/a-propos`, `/contact`, `/legal/cgv`, `/legal/confidentialite`, `/legal/livraison-retours` pas de 404)
- [ ] Contenus FR premium, cohérents VELMIRYS, pas de liens morts, pas de TODO brut visible
- [ ] Si `pageContent` Sanity existe, son `body` s'affiche (PortableText), sinon fallback stylé
- [ ] Responsive vérifié (375, 768, 1440) — pas de débordement horizontal, grids adaptatifs
- [ ] A11y basique : h1 unique/page, hiérarchie, focus-visible, contrasts, details keyboard
- [ ] Build ne casse pas si Sanity indisponible (try/catch + fallback)
- [ ] Footer liens complets

## 4. Hors périmètre
- Pas de commit (phase parente).
- Pas de traductions EN (FR only).
- Pas de fetch dynamique client côté contact (tout SSR).

## 5. Risques & mitigations
| Risque | Mitigation |
|--------|------------|
| Sanity `TODO_PROJECT_ID` → fetch échoue | try/catch + fallback hardcodé, `revalidate` quand même |
| Contenus `CONTENUS-A-FOURNIR.md` manquants | Placeholders stylisés `bg-sand` + texte « À compléter » |
| ESLint `react-hooks/set-state-in-effect` | Aucun `useEffect` avec setState ; pages server only |
| Images manquantes | `div` coloré + motif, pas de 404 |

## 6. Ordre d'exécution
1 → 2 → 3 → 4,5,6 en parallèle → 7 → 8 (build). Log décisions dans `DECISIONS.md` si arbitrage.

## 7. Validation
```bash
pnpm build
# puis pnpm dev et curl -I http://localhost:3000/a-propos etc. → 200
```
