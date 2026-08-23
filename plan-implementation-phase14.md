# Plan d'implémentation — Phase 14 : Accessibilité WCAG 2.1 AA (PRD §8.2 + §7.4 prefers-reduced-motion)

> Objectif PRD §8.2 : contrastes AA 4.5:1, focus visible partout, navigation clavier complète (builder, drawer), aria-labels, prefers-reduced-motion respecté (Lenis, GSAP, BoxModel float, confetti), alt text, scène 3D jamais seule porteuse d'info, a11y basique. Socle déjà partiel : `globals.css` a `@media prefers-reduced-motion`, `BoxFallback2D` et `AdaptiveQuality` respectent partiellement. Audit complet manquant.

## 1. Tâches atomiques

| # | Tâche | Fichiers | Priorité | Dépendance |
|---|-------|----------|----------|------------|
| 0 | Créer ce plan `plan-implementation-phase14.md` | `plan-implementation-phase14.md` | P0 | — |
| 1 | Hook `usePrefersReducedMotion` + util `cn` focus ring | `web/src/hooks/usePrefersReducedMotion.ts`, `web/src/lib/a11y.ts` | P0 | — |
| 2 | `globals.css` — tokens AA, focus-visible global, skip-link, tap-target, amélioration `prefers-reduced-motion` | `web/src/app/globals.css` | P0 | 1 |
| 3 | `layout.tsx` — skip-link `a[href="#main"]` sr-only, `id="main"` + `tabIndex=-1`, landmarks `header/main/footer/nav`, `lang="fr"` déjà OK | `web/src/app/layout.tsx` | P0 | 2 |
| 4 | `Header.tsx` — clavier complet, focus `ring-accent`, aria-current, bouton burger mobile + drawer `Esc` + focus-trap, `aria-label` cart, `nav aria-label` | `web/src/components/layout/Header.tsx` | P0 | 2,3 |
| 5 | `CartDrawer.tsx` — `role=dialog` `aria-modal=true`, focus-trap, `Esc` close, restore focus, `aria-label` icon-only, `focus-visible:ring`, `min-h-[44px]` | `web/src/components/cart/CartDrawer.tsx`, `web/src/components/cart/CartDrawerTrigger.tsx` | P0 | 1,2 |
| 6 | `BoxBuilder.tsx` — stepper `aria-current`, catégories `role=group` `aria-pressed`, tuiles `disabled` + `aria-label`, retirer `aria-label`, `label` associée au textarea, `aria-describedby` compteur, boutons focus-ring, tap-target 44px, confetti désactivé si `prefers-reduced-motion` | `web/src/app/box/BoxBuilder.tsx` | P0 | 1,2 |
| 7 | `BoxScene.tsx` + `BoxModel.tsx` + `BoxFallback2D.tsx` + `AdaptiveQuality.tsx` + `FlyingItem.tsx` + `HomeHero3D.tsx` — scènes `aria-hidden`, `role=img` + `aria-label` fallback, `float=false` si reduced, GSAP/ScrollTrigger désactivé, `FlyingItem` instant si reduced, texte alternatif systématique | `web/src/components/box/*` | P0 | 1 |
| 8 | `CheckoutForm.tsx` — `label for`, `aria-invalid`, `aria-describedby`, `required` + `aria-required`, `role=alert` `aria-live`, focus-ring, erreurs liées aux inputs, `min-h-[44px]` | `web/src/components/checkout/CheckoutForm.tsx` | P0 | 2 |
| 9 | `BoutiqueFilters.tsx` + `VariantSwatches.tsx` + `AddToCartButton.tsx` + `ProductGallery.tsx` — `focus-visible:ring`, `aria-pressed/current`, `aria-label` icon-only, `alt` systématique, tap-target 44px | `web/src/components/shop/*` | P0 | 2 |
| 10 | `PanierClient.tsx` + boutique + pages éditoriales — `nav aria-label=breadcrumb`, `h1` unique, `ul/li` sémantique, `aria-live` counts, `focus-visible`, `min-h-[44px]` | `web/src/app/panier/*`, `web/src/app/boutique/**/*`, `web/src/app/a-propos/*`, `web/src/app/contact/*`, `web/src/app/legal/**/*`, `web/src/app/page.tsx` | P1 | 2 |
| 11 | `Footer.tsx` — `contentinfo`, `nav` légaux, `focus-visible:ring`, contraste vérifié | `web/src/components/layout/Footer.tsx` | P1 | 2 |
| 12 | Contraste audit global — `text-ink/50` → `text-ink/60` (4.54:1 passe AA, /50 échoue 3.30:1), `mauve` texte évité sur `cream`, `accent` sur `sand` 4.8 passe, `accent` sur `cream` 5.22 passe | Tous `*.tsx` listés + `globals.css` tokens | P0 | 2 |
| 13 | Vérifier tap-targets 44px min, responsive 375/768/1440 (pas de débordement, grille fluide) | Vérif visuelle + classes `min-h-[44px]` `min-w-[44px]` | P1 | 4-10 |
| 14 | Build + lint verts `pnpm lint && pnpm build` — corriger jusqu'à vert | `web/` | P0 | 1-13 |

## 2. Spécification détaillée

### 2.1 Hook `usePrefersReducedMotion`

```ts
// web/src/hooks/usePrefersReducedMotion.ts
"use client";
import { useEffect, useState } from "react";
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const h = () => setReduced(m.matches);
    m.addEventListener?.("change", h);
    return () => m.removeEventListener?.("change", h);
  }, []);
  return reduced;
}
```

Utilisé partout : `BoxModel` (`float=false` si reduced), `BoxScene` (`fallback` forcé), `HomeHero3D` (pas de `ScrollTrigger`, `lidOpen=1`), `FlyingItem` (pas de `gsap`, `onDone` direct), `BoxBuilder` confetti `null` si reduced, futur `Lenis` `lerp=1` / désactivé.

### 2.2 `globals.css`

```css
@import "tailwindcss";
@theme { /* tokens inchangés mais documentés contrastes */ }
body { background: var(--color-cream); color: var(--color-ink); }
/* Focus visible global — AA */
:where(a, button, [role="button"], input, textarea, select, summary):focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
/* Skip link */
.skip-link {
  position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden;
}
.skip-link:focus {
  left:1rem; top:1rem; width:auto; height:auto; padding:.5rem 1rem; background:var(--color-ink); color:var(--color-cream); border-radius:9999px; z-index:100;
}
/* prefers-reduced-motion : déjà présent, étendu */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; scroll-behavior:auto !important; }
  /* désactive GSAP smooth */
  html.lenis, html.lenis body { height:auto; }
}
```

### 2.3 `layout.tsx`

- Après `<body>` ajouter :
  ```tsx
  <a href="#main" className="skip-link">Aller au contenu principal</a>
  ```
- `<main id="main" tabIndex={-1} className="flex-1 focus:outline-none">`
- `<Header />` et `<Footer />` déjà landmarks, mais wrapper `nav` dans Header avec `aria-label="Navigation principale"` ; Footer `role="contentinfo"`.

### 2.4 `Header.tsx`

- Ajout `nav aria-label="Navigation principale"` + `aria-current="page"` sur lien actif (via `usePathname`).
- Tous `Link` : `className="... focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-full … min-h-[44px] inline-flex items-center"` .
- Mobile : bouton burger `aria-expanded`, `aria-controls="nav-mobile"`, `aria-label="Ouvrir le menu"` ; drawer mobile en `role="dialog"` si ouvert, focus-trap simple + `Esc` ferme.
- `CurrencySwitcher` déjà `role=group` OK, ajouter `focus-visible`.
- `CartDrawerTrigger` bouton : déjà `aria-label` OK, ajouter `focus-visible:ring`.

### 2.5 `CartDrawer.tsx`

- Focus-trap : `useRef<aside>`, `useEffect` sur `open` : mémorise `previouslyFocused`, focus premier bouton `close`, `keydown` listener `Tab` boucle + `Escape` → `onClose`, restore focus au close.
- `aside` : `role="dialog"` `aria-modal="true"` `aria-label="Panier"` déjà OK, ajouter `aria-labelledby` si titre id.
- Tous boutons `±` `Retirer` `Fermer` : `aria-label` explicite, `focus-visible:ring-2 ring-accent`, `min-w-[44px] min-h-[44px]` (`h-7` → `h-11` ou `min-h-[44px]`).
- Overlay bouton fermeture : `aria-label="Fermer le panier (Échap)"`.
- Liens dans drawer : `focus-visible`.
- Prévenir scroll lock déjà OK.

### 2.6 `BoxBuilder.tsx`

- **Stepper** : `nav aria-label="Étapes de composition"` + `ol` ; chaque `span` devient `li` avec `aria-current="step"` si actif, `focusable=false`.
- **Catégories** : `div role="group" aria-label="Filtrer par catégorie"` + chaque `button` : `aria-pressed={category===c}`, `focus-visible:ring`, `min-h-[44px]`.
- **Tuiles** : `button` ajouter : `aria-label="Ajouter ${product.title} — ${variant.colorName} à la box"` + `disabled` + `focus-visible:ring`, `min-h-[44px]`.
- **Liste items** : `ul aria-label="Articles dans la box"` ; chaque `li` avec bouton `Retirer` `aria-label` + `focus-visible`, `min-h-[44px]`.
- **Customizer** : `label htmlFor="box-gift-message"` (ajouter `id` au textarea), `aria-describedby="gift-counter gift-preview"` ; compteur `id="gift-counter"` `aria-live="polite"` ; boutons exemples `focus-visible`.
- **Carte** : chaque `button` : `aria-pressed={active}` `aria-label="Choisir carte ${card.name}${active?' — sélectionnée':''}"` + `focus-visible:ring`, `img alt={card.name}` déjà OK.
- **Navigation étapes** : boutons `Modifier` / `Voir ma box` / `Personnaliser` : `focus-visible`, `min-h-[44px]`, `disabled` annoncé via `aria-disabled`.
- **Preview** : `h3` → `h2` sémantique correcte ; confetti : `if (reduced) return null` via hook ; sinon `aria-hidden`.
- **Scène** : wrapper `#box-scene-anchor` avec `role="img" aria-label="Box VELMIRYS ouverte contenant ${items.length} articles, emballage cadeau offert"` + `aria-hidden` sur Canvas, texte alternatif sous la scène (déjà liste items — OK cf. PRD « scène jamais seule porteuse d'info »).

### 2.7 `BoxScene` / `BoxModel` / `BoxFallback2D` / `FlyingItem` / `HomeHero3D` / `AdaptiveQuality`

- `AdaptiveQuality.detectTier()` déjà respecte `prefers-reduced-motion` → low → fallback ; conserver.
- `BoxScene` : prop `float` forcée `false` si `reduced` ; `tier==="low"` → `BoxFallback2D`; wrapper `div role="img" aria-label="..."` + `Canvas aria-hidden="true"`.
- `BoxModel` : `usePrefersReducedMotion` → si `reduced || !float` pas d'`useFrame` float/lid lerp instant (`lidObject.rotation.x = target` direct) ou désactivé.
- `TissuePaper` : `useFrame` neutralisé si `reduced`.
- `BoxFallback2D` : ne plus `aria-hidden` seul ; ajouter `role="img" aria-label="Box illustration 2D — ${itemCount}/5"` mais parent BoxScene déjà label, donc interne `aria-hidden`.
- `FlyingItem` : si `reduced` → `useEffect` appelle `onDone` immédiatement sans `gsap` (ou `gsap` duration 0) ; élément `aria-hidden`.
- `HomeHero3D` : si `reduced` → pas de `gsap` `ScrollTrigger`, `lidOpen=1` fixe, spacer réduit, halo statique, items orbitants fixes ; `section aria-label="Animation d'ouverture de box — décorative"` `aria-hidden`.

### 2.8 `CheckoutForm.tsx`

- Chaque `input` : `aria-required="true"` `aria-invalid={!!fieldError}` `aria-describedby={fieldError ? "error-xxx" : "hint-xxx"}`.
- Erreurs : champ par champ (name/phone/zone) avec `<p id="error-xxx" role="alert">` + global `role="alert" aria-live="assertive"`.
- `label` `htmlFor` déjà OK ; ajouter `required` visuel `*` avec `aria-hidden`.
- `input` classes : `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` + `aria-invalid:border-accent`.
- Bouton submit : `min-h-[44px]` `focus-visible:ring`, `disabled:opacity-50` + `aria-disabled`.
- Honeypot : `aria-hidden="true"` `tabIndex={-1}` déjà OK.

### 2.9 Shop

- `BoutiqueFilters` : déjà `role=group` OK, chaque `Link` : `aria-current` + `focus-visible:ring-2 ring-accent rounded-full`.
- `VariantSwatches` : `Link` déjà `aria-label`/`aria-current` OK, ajouter `focus-visible:ring-2 ring-accent ring-offset-2` + `min-h-[44px] min-w-[44px]` (actuel `h-10 w-10` → passer à `h-11 w-11 min-h-[44px]`).
- `AddToCartButton` : `aria-label` OK, ajouter `focus-visible:ring`, `min-h-[44px]`, `aria-live="polite"` pour `justAdded`.
- `ProductGallery` : `Image alt="${title} — ${colorName}"` déjà OK ; thumbs `alt=""` (décoratif) OK ; conteneur fallback `role="img"` déjà OK.

### 2.10 Panier & pages éditoriales & home & breadcrumbs

- `PanierClient` : qty boutons `aria-label="Diminuer quantité"` / `"Augmenter quantité"` + `focus-visible` + `min-h-[44px]` ; `ul` avec `aria-label`.
- `boutique/page.tsx` + `boutique/[slug]/page.tsx` + `a-propos` + `contact` + `legal` + `box/page.tsx` : ajouter `nav aria-label="Fil d'Ariane"` contenant `ol` breadcrumb visible (ou au moins `aria-label` sur breadcrumbLd) ; `h1` unique déjà OK sauf `box` + `panier` vérifié.
- Toutes listes produits : `ul`/`li` sémantique déjà OK, ajouter `aria-label` région.
- Home : sections `aria-labelledby` avec `h2 id`, `nav` shades `aria-label`.
- `Confirmation` : `h1` OK, message `pre` avec `aria-label`.

### 2.11 Footer

- `footer role="contentinfo"` (implicite `<footer>` suffit, ajouter `aria-label="Pied de page"`).
- Chaque `Link` : `focus-visible:ring-2 ring-accent`.
- S'assurer `text-ink/60` etc. restent AA (4.54).

### 2.12 Contraste

- Audit tokens : `ink #1C1917` sur `cream #FAF7F2` 16.37:1 ✅, `accent #B4413C` sur `cream` 5.22 ✅, `accent` sur `sand #F3EDE4` 4.80 ✅, `slate #3E4C63` sur `cream` 8.12 ✅, `choco #5C3A2E` sur `cream` 9.36 ✅, `wine #4A1F24` sur `cream` 12.99 ✅, `mauve #9B7E8C` sur `cream` 3.41 ❌ → jamais de texte mauve sur cream ; `mauve` sur `ink` 4.79 ✅ mais décoratif only.
- Opacités : `ink/60` ≈ `#74716E` sur cream 4.54 ✅, `ink/50` ≈ `#8B8884` 3.30 ❌ → remplacer tout `text-ink/50` lisible par `text-ink/60` (`.tsx` ~20 occurrences) ; `text-ink/40` 2.50 ❌ → réservé décoratif (`aria-hidden` ou `< 18px` non-texte) ou passer à `/60`.
- `accent/10` bg avec `text-accent` 5.22 ✅.
- Vérif tap-targets : tous `button`/`a` ≥44×44 via `min-h-[44px]` `min-w-[44px]` `py-3` (≈44) + `px-6`.

### 2.13 Responsive

- Grilles : `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` déjà fluides ; vérifier `max-w-6xl mx-auto px-6` pas de `overflow-x`.
- Test 375/768/1440 visuel devtools + `pnpm build` pas d'erreur `next build` (Turbopack).

## 3. Critères d'acceptation (PRD §8.2)

- [ ] Contrastes AA (`accent`/`ink` sur `cream`/`sand` ≥4.5:1, pas de `text-ink/50` lisible, `mauve` non texte) — vérifié via `contrast()` script
- [ ] Focus visible partout (`:focus-visible` global + `ring-accent` sur tous les интерактив) — tab nav traversable
- [ ] Clavier complet (Tab, Shift+Tab, Esc drawer, Entrée sur boutons, BoxBuilder catégories/swatches/stepper, CartDrawer focus-trap)
- [ ] Aria correct (icon-only `aria-label`, images `alt`, canvas `aria-hidden` + texte alternatif, `role=dialog` `aria-modal`, `aria-current`, `aria-pressed`, `aria-invalid`, `aria-describedby`, `aria-live`)
- [ ] `prefers-reduced-motion` respecté (Lenis off, GSAP ScrollTrigger off, BoxModel float off, TissuePaper off, FlyingItem instant, confetti off, BoxFallback forcé)
- [ ] Skip link `a[href="#main"]` sr-only focus-visible + landmarks `header/main/footer/nav` + `h1` unique
- [ ] Sémantique (headings hiérarchie, listes `ul/ol`, breadcrumbs `nav aria-label`)
- [ ] Formulaire panier : labels associés, `required`, `aria-invalid`, `aria-describedby`, focus visible
- [ ] Tap-targets 44px min, responsive 375/768/1440 sans débordement
- [ ] Scène 3D jamais seule porteuse d'info (liste textuelle synchronisée)
- [ ] `pnpm lint` 0 error, `pnpm build` vert

## 4. Hors périmètre

- Pas de commit (consigne phase).
- Pas d'ajout `Lenis` smooth-scroll si non déjà présent (guard seulement) — pas de nouvelle lib.
- Pas de tests axe® automatisés (manuel + `eslint jsx-a11y` déjà via next).
- Pas de traductions EN, pas de `EN` aria.

## 5. Risques & mitigations

| Risque | Mitigation |
|--------|------------|
| `text-ink/50` → `/60` casse design léger | `/60` reste doux, 4.54 passe AA, visuellement proche ; décoratifs `aria-hidden` gardent `/40` |
| Focus ring double (global + Tailwind) | Global `outline` + Tailwind `ring` coexistent, pas de conflit ; préférence `ring-accent` Tailwind + fallback outline |
| `CartDrawer` focus-trap boucle infinie | Listener `keydown` Tab avec `querySelectorAll` focusable + `preventDefault` seulement quand boucle |
| `HomeHero3D` GSAP désactivé casse layout sticky | Si `reduced` → hauteur fixe `420px` sans spacer, `lidOpen=1` |
| `BoxBuilder` confetti off déçoit | Remplacé par toast statique `Box ajoutée` sans anim chute |
| `build` casse sur `usePrefersReducedMotion` SSR | `useEffect` guard `typeof window` ; état initial `false` SSR safe |

## 6. Ordre d'exécution

0 (ce plan) → 1 → 2 → 3 → 4,5,6,7 en parallèle → 8,9,10,11 → 12 (contraste sweep) → 13 (tap-target sweep) → 14 (lint/build boucle).

## 7. Validation

```bash
pnpm lint
pnpm build
# Manuel :
pnpm dev
# Tab traversale Header → BoutiqueFilters → VariantSwatches → AddToCart → BoxBuilder → CartDrawer (Esc) → CheckoutForm (labels + erreurs)
# DevTools Rendering → Emulate prefers-reduced-motion → vérifier BoxScene fallback + pas de flottement + pas de confetti + GSAP statique
# Lighthouse Accessibility ≥90, axe DevTools 0 violation
# Responsive 375/768/1440 pas d'overflow
```

