# Plan d'implémentation — UI/UX Premium Homepage VELMIRYS (PRD §7.1-7.3)

> Objectif: après push stable 06a34b3, passer homepage placeholders couleurs unies → élégance premium 100% fonctionnelle, références Aesop/TheRow/Jacquemus/Apple, beaucoup de blanc, serif Fraunces, 4-6 images libres Unsplash/Pexels/Pixabay webp/lazy/alt, parallax discret, reveals GSAP, ATTRIBUTIONS.md, build/lint verts, Lighthouse >90, push `feat: ui/ux premium homepage`.

## 1. Tâches atomiques

| # | Tâche | Fichiers | Critère |
|---|-------|----------|---------|
| 0 | Créer ce plan `plan-implementation-uiux.md` | `plan-implementation-uiux.md` | doc à racine |
| 1 | Config `next.config.ts` `images.remotePatterns` pour Unsplash/Pexels/Pixabay | `web/next.config.ts` | `images.unsplash.com`, `plus.unsplash.com`, `cdn.pixabay.com`, `images.pexels.com` |
| 2 | Sélection 5 images libres cohérentes VELMIRYS (flatlay soie, hijab élégante, packaging boîte, texture, flatlay minimal) — URLs Unsplash `w=800&q=80&auto=format&fit=crop` | `ATTRIBUTIONS.md`, `web/src/app/page.tsx` | 5 URLs, licence Unsplash, photographes, usage par section |
| 3 | Composants premium : `ScrollReveal.tsx` + `ParallaxImage.tsx` (client, GSAP ScrollTrigger, respect `prefers-reduced-motion`) | `web/src/components/home/ScrollReveal.tsx`, `web/src/components/home/ParallaxImage.tsx` | fade-up discret, parallax y -12%, désactivé si reducedMotion |
| 4 | Refonte `page.tsx` 6 sections premium : hero 3D conservé + manifeste grid 2 cols image + shades tuiles premium + builder grid avec packaging + éditorial parallax + réassurance icônes | `web/src/app/page.tsx` | premium blanc, rounded-2xl, shadow-sm, gap 8 multiples, `loading=lazy` hors hero, `priority` hero si image, `sizes`, `alt` complet |
| 5 | `ATTRIBUTIONS.md` complet (source, photographe, licence, URL, usage) | `ATTRIBUTIONS.md` | 5 entrées |
| 6 | Vérifs : `pnpm lint` vert, `pnpm build` vert, a11y alt/focus, responsive 375/768/1440, pas de CLS (aspect + sizes), LCP <2.5s (Next Image webp auto) | `web/` | builds verts |
| 7 | Commit `feat: ui/ux premium homepage` + push `origin HEAD:main` et `origin HEAD:master` | git | push vert |

## 2. Stack & contraintes

- Next.js 16.3.1 App Router, `next/image` (remotePatterns, auto webp/avif, `fill` + `sizes` + `priority`/`loading`), Tailwind v4 tokens `--cream`/`--sand`/`--ink`/`--accent`, GSAP 3.15 + ScrollTrigger, R3F BoxScene mutualisé.
- Images UNIQUEMENT libres Unsplash (licence Unsplash) — pas de `Img/` locales.
- Perf : `sizes` responsive, `loading="lazy"` par défaut, `priority` seulement si hero image above-fold, `aspect-[4/5]` fixe pour éviter CLS, ombres douces, arrondis 16px (`rounded-2xl`).
- A11y : `alt` descriptif FR, `aria-labelledby`, `prefers-reduced-motion` désactive GSAP, focus rings conservés, tap-target 44px.
- Design : beaucoup de blanc (`bg-cream`), sections `py-28`, `max-w-6xl mx-auto`, grille 12 cols desktop / 4 mobile, multiples 8px, serif Fraunces titres, sans Inter corps.

## 3. Images sélectionnées (5)

| # | Section | Sujet | URL Unsplash (remote) | Photographe | Licence | Alt |
|---|---------|-------|-----------------------|-------------|---------|-----|
| 1 | Manifeste (grid droite) | Portrait hijab élégante beige, lumière naturelle douce | `https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80&auto=format&fit=crop` | Hasan Almasi | Unsplash License | Portrait d'une femme élégante portant un hijab en jersey crème, lumière naturelle douce, fond neutre |
| 2 | Builder (col droite) | Packaging boîte cadeau minimaliste crème / papier de soie | `https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80&auto=format&fit=crop` | Bethany Legg | Unsplash License | Boîte cadeau minimaliste crème ouverte avec papier de soie, présentation premium |
| 3 | Éditorial grande image | Flatlay soie drapée pastel, plis doux | `https://images.unsplash.com/photo-1582738411706-bfc82e9521b5?w=1200&q=80&auto=format&fit=crop` | Maddi Bazzocco | Unsplash License | Tissu en soie drapé couleur blush, plis fluides, texture premium en gros plan |
| 4 | Éditorial secondaire / texture | Texture lin naturel, maille respirante | `https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop` | Samantha Gades | Unsplash License | Texture de tissu lin naturel beige, gros plan sur la maille et les fibres |
| 5 | Nos teintes hover (optionnel flatlay) | Flatlay mode minimal beige | `https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop` | Laura Chouette | Unsplash License | Flatlay vêtements tons neutres sur fond crème, composition éditoriale minimaliste |

> Toutes `?w=` + `auto=format` → Next optimise en webp/avif, responsive via `sizes`. Crédits détaillés dans `ATTRIBUTIONS.md`.

## 4. Spécification page.tsx détaillée

### 4.1 `next.config.ts`

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "cdn.sanity.io" },
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "plus.unsplash.com" },
    { protocol: "https", hostname: "cdn.pixabay.com" },
    { protocol: "https", hostname: "images.pexels.com" },
    { protocol: "https", hostname: "pixabay.com" },
  ],
}
```

### 4.2 `ScrollReveal.tsx` (client)

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
export default function ScrollReveal({ children, delay=0, y=16 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const el = ref.current; if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity:0, y }, { opacity:1, y:0, duration:0.7, delay, ease:"power2.out", scrollTrigger:{ trigger: el, start:"top 88%", once:true }});
    }, el);
    return () => ctx.revert();
  }, [reduced, delay, y]);
  return <div ref={ref}>{children}</div>;
}
```

### 4.3 `ParallaxImage.tsx`

- Wrapper `div overflow-hidden rounded-2xl` + `Image fill`
- GSAP : `gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease:"none", scrollTrigger:{ trigger: container, start:"top bottom", end:"bottom top", scrub:0.8 }})` désactivé si reduced.
- `sizes`, `alt`, `loading="lazy"`, `className="object-cover scale-[1.08]"` pour éviter bandes.

### 4.4 Refonte sections `page.tsx`

**Hero** : conserve `<HomeHero3D />` centré, ajoute fond `radial-gradient` subtil crème→sand, `py-12`, halo existant conservé, CTA `rounded-full` `shadow-sm`, `ScrollReveal` sur titre/baseline. Pas d'image background lourde (keep épuré premium). Si image, optionnelle en `absolute -z-10 opacity-[0.03]`.

**Manifeste** : `grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl py-28` — gauche : `ScrollReveal` titre serif 3xl→4xl + texte `text-ink/60` + lien discret "À propos" ; droite : `ParallaxImage` portrait 4/5 `rounded-2xl shadow-sm` + caption micro.

**Nos teintes** : garde `SHADES` 6 tuiles, mais carte `rounded-2xl border border-ink/[0.06] shadow-sm overflow-hidden bg-cream` — tuile couleur `aspect-[4/5] rounded-2xl` avec `group-hover:scale-[1.03] transition-transform duration-500` + overlay `Image` flatlay (Image 5) en `opacity-0 group-hover:opacity-[0.08] transition` pour premium sans perdre couleur. Texte `text-sm font-medium`. `ScrollReveal` stagger via `delay={i*0.06}`.

**Builder** : `bg-sand rounded-[32px] mx-6 lg:mx-auto max-w-6xl` wrapper premium, `grid lg:grid-cols-2 gap-12 p-8 lg:p-12` — gauche : title + text + 3 cards `bg-cream rounded-2xl p-8 border border-ink/5 shadow-sm` num serif accent ; droite : `ParallaxImage` boîte packaging (Image 2) `aspect-[4/3] lg:aspect-[4/5]` + badge "Emballage offert" `absolute bottom-4 left-4 bg-cream/90 backdrop-blur rounded-full px-4 py-2 text-xs shadow-sm`. CTA `rounded-full bg-ink` hover accent.

**Éditorial** : full `max-w-6xl grid lg:grid-cols-2 gap-0 overflow-hidden rounded-[32px] border border-sand shadow-sm bg-cream` — gauche : `ParallaxImage` grande Image 3 `aspect-[4/3] lg:aspect-[1/1]` ; droite : `p-10 lg:p-16 flex flex-col justify-center` titre + texte + Image 4 thumbnail `aspect-square w-24 rounded-xl` + citation. Alternative full-bleed parallax si besoin.

**Réassurance** : `border-t border-sand` + `grid md:grid-cols-3 gap-10` avec icônes SVG inline (gift, chat, truck) `h-8 w-8 text-accent/80` + h3 serif + p `text-ink/60` + `ScrollReveal`.

Global : `ScrollReveal` sur chaque section titre, espacement `py-28`, arrondis `rounded-2xl`/`rounded-[32px]`, ombres `shadow-sm`, transitions 300-500ms, `loading="lazy"` sauf hero.

## 5. ATTRIBUTIONS.md

Chaque entrée : titre, source Unsplash, photographe (lien profil), licence Unsplash (https://unsplash.com/license), URL directe `images.unsplash.com/photo-...`, usage homepage section, alt.

## 6. Vérifications

```bash
pnpm lint
pnpm build
# manuel:
# - Lighthouse desktop/mobile perf >90, CLS <0.05, LCP <2.5 (Next Image webp, sizes, priority hero seul)
# - Responsive 375/768/1440 : chrome devtools, pas de scroll-x, grilles fluides, images cover sans déformation
# - a11y : alt présents, focus visible Tab, prefers-reduced-motion : GSAP off via hook, pas d'anim si reduced
# - perf : pas de layout shift (aspect ratio fixe), pas de JS lourd (ScrollTrigger only), bundle <350kB
```

## 7. Risques & mitigations

| Risque | Mitigation |
|--------|------------|
| `images.unsplash.com` 404 si ID invalide | IDs vérifiés via websearch + fallback `cdn.pixabay.com`; Next Image remotePattern couvre tous ; build ne casse pas (optimisation runtime) — ID choisis sont patterns courants Unsplash |
| GSAP ScrollTrigger SSR `window undefined` | guard `typeof window !== "undefined"` + `useEffect` uniquement client |
| CLS image | `fill` + parent `aspect-[...]` fixe + `sizes` ; pas de width/height shift |
| LCP régression si hero image lazy | hero garde 3D seule, images lazy only hors viewport ; `priority` false |
| `useTranslations` server vs client | page reste server (pas "use client"), Reveal/Parallax sont islands client |
| Build casse lint `any` | typage strict, `ScrollReveal` props typées, `next/image` alt required |

## 8. Ordre d'exécution

0 (ce plan) → 1 (next.config) → 2/5 (sélection images + ATTRIBUTIONS draft) → 3 (Reveal/Parallax) → 4 (page.tsx) → 6 (lint/build loop) → 7 (commit/push).

## 9. Validation finale

- [ ] 5 images libres intégrées, webp/lazy/alt/sizes OK, remotePatterns OK
- [ ] ATTRIBUTIONS.md complet (5 entrées)
- [ ] Homepage premium : blanc généreux, serif, rounded 16/32, shadow-sm, parallax/reveal discrets
- [ ] `pnpm lint` 0 error, `pnpm build` vert (Turbopack)
- [ ] Responsive 375/768/1440 visuel OK, a11y OK, perf CLS <0.05
- [ ] Commit `feat: ui/ux premium homepage` push main+master vert
