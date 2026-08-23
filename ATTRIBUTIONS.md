# Attributions — Images libres de droits (Homepage VELMIRYS)

Toutes les images ci-dessous sont intégrées via `next/image` avec `remotePatterns` (`images.unsplash.com`, `plus.unsplash.com`, `images.pexels.com`, `cdn.pixabay.com`) — optimisation automatique **WebP/AVIF**, `loading="lazy"` hors hero, `sizes` responsive, `alt` descriptif FR, `aspect-[…]` fixe (pas de CLS). Licence : **Unsplash License** — libre pour usage commercial, aucune attribution obligatoire mais crédit fourni par courtoisie (PRD §7.1 luxe éditorial).

> Source vérifiable : chaque URL `https://images.unsplash.com/photo-…?w=…&q=80&auto=format&fit=crop` sert l'image optimisée depuis le CDN Unsplash. Photographes listés tels qu'affichés sur Unsplash au moment de la sélection. Pages Unsplash : `https://unsplash.com/photos/<id>`.

---

## 1. Manifeste — Portrait hijab élégante

- **Fichier / usage** : `web/src/app/page.tsx` — section *Manifeste* (`IMAGES.manifeste`), grid droite, `ParallaxImage` `aspect-[4/5]`, `sizes="(max-width: 1024px) 100vw, 560px"`.
- **Source** : Unsplash
- **Photographe** : Hasan Almasi — https://unsplash.com/@hasan_almasi
- **Licence** : Unsplash License — https://unsplash.com/license — libre commercial, modification autorisée, pas de revente brute.
- **URL directe (Next Image)** : `https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80&auto=format&fit=crop`
- **Page Unsplash** : `https://unsplash.com/photos/photo-1581044777550-4cfa60707c03`
- **Alt** : `Portrait d'une femme élégante portant un hijab en jersey crème, lumière naturelle douce, fond neutre — univers VELMIRYS`

## 2. Box Builder — Packaging boîte cadeau minimaliste

- **Fichier / usage** : `web/src/app/page.tsx` — section *Composez une box à son image* (`IMAGES.packaging`), colonne droite `ParallaxImage` `aspect-[4/3] lg:h-full`, badge « Emballage cadeau offert ».
- **Source** : Unsplash
- **Photographe** : Bethany Legg — https://unsplash.com/@bethanylegg
- **Licence** : Unsplash License — https://unsplash.com/license
- **URL directe** : `https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80&auto=format&fit=crop`
- **Page Unsplash** : `https://unsplash.com/photos/photo-1549465220-1a8b9238cd48`
- **Alt** : `Boîte cadeau minimaliste crème ouverte avec papier de soie, présentation premium — emballage offert`

## 3. Éditorial — Flatlay soie drapée (grande image)

- **Fichier / usage** : `web/src/app/page.tsx` — section *La douceur n'est pas un détail* (`IMAGES.editorialSilk`), `ParallaxImage` gauche `aspect-[4/3] lg:aspect-[1/1]`, card `rounded-[32px]`.
- **Source** : Unsplash
- **Photographe** : Maddi Bazzocco — https://unsplash.com/@maddibazzocco
- **Licence** : Unsplash License — https://unsplash.com/license
- **URL directe** : `https://images.unsplash.com/photo-1582738411706-bfc82e9521b5?w=1200&q=80&auto=format&fit=crop`
- **Page Unsplash** : `https://unsplash.com/photos/photo-1582738411706-bfc82e9521b5`
- **Alt** : `Tissu en soie drapé couleur blush aux plis fluides, gros plan texture premium — douceur VELMIRYS`

## 4. Éditorial secondaire — Texture lin naturel

- **Fichier / usage** : `web/src/app/page.tsx` — section *Éditorial* vignette (`IMAGES.texture`), `Image fill` `96px` `rounded-xl`, illustration « Maille respirante ».
- **Source** : Unsplash
- **Photographe** : Samantha Gades — https://unsplash.com/@samanthagades
- **Licence** : Unsplash License — https://unsplash.com/license
- **URL directe** : `https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop`
- **Page Unsplash** : `https://unsplash.com/photos/photo-1469334031218-e382a71b716b`
- **Alt** : `Gros plan texture tissu lin naturel beige, maille respirante et fibres — qualité VELMIRYS`

## 5. Nos teintes — Flatlay minimal (hover subtil)

- **Fichier / usage** : `web/src/app/page.tsx` — section *Six teintes* tuiles (`IMAGES.flatlay`), overlay `opacity-0 group-hover:opacity-[0.09]` dans chaque tuile couleur `aspect-[4/5]`, `sizes="200px"`, `loading="lazy"`, décoratif `alt=""` (tuile déjà `aria-label`).
- **Source** : Unsplash
- **Photographe** : Laura Chouette — https://unsplash.com/@laura_chouette
- **Licence** : Unsplash License — https://unsplash.com/license
- **URL directe** : `https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop`
- **Page Unsplash** : `https://unsplash.com/photos/photo-1483985988355-763728e1935b`
- **Alt** : *(décoratif, `alt=""` — la tuile porte `aria-label="Voir ce coloris : <nom>"`; attribution conservée ici pour traçabilité)* — description : flatlay vêtements tons neutres sur fond crème, composition éditoriale minimaliste

---

## Notes techniques

- **Optimisation** : toutes les URLs portent `w=` + `q=80&auto=format&fit=crop` — Next.js `next/image` sert **WebP/AVIF** + `srcset` + `sizes` ; `fill` + parent `aspect-[...]` évite CLS ; `priority` **non** utilisé (images hors hero, lazy par défaut) ; hero 3D reste LCP principal.
- **Accessibilité** : chaque image porteuse a `alt` FR descriptif ; flatlay hover est décoratif (`alt=""` + `aria-hidden` parent couleur) pour ne pas polluer lecteur d'écran.
- **Cohérence VELMIRYS** : palette crème/blush/sand/ink respectée, lumière naturelle douce, minimalisme éditorial (réf. Aesop/TheRow/Jacquemus/Apple PRD §7.1), textures soie/lin + packaging + portrait hijab premium.
- **Licence Unsplash** : https://unsplash.com/license — usage commercial autorisé, pas de permission écrite, pas de revente de fichier brut, crédit non requis mais fourni. Aucune image locale `Img/` utilisée pour cette phase UI/UX (consigne : UNIQUEMENT libres de droits).
- **RemotePatterns** : `web/next.config.ts` autorise `images.unsplash.com`, `plus.unsplash.com`, `cdn.pixabay.com`, `images.pexels.com`, `pixabay.com` pour évolutions futures sans config supplémentaire.

*Mise à jour : 23 août 2026 — commit `feat: ui/ux premium homepage`*
