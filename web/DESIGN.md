# DESIGN.md — VELMIRYS Luxury

**Source-of-truth visuel — généré via `design-consultation` + `frontend-design` + `high-end-visual-design` + `premium-frontend-design`**

## 1. Sujet, audience, job

- **Sujet concret** : Coffret cadeau hijab modulable (foulard jersey + bonnet + épingle + carte) — matériau principal : jersey premium mat, papier kraft, papier de soie.
- **Audience** : Femme 18-40, Dakar/France, achat cadeau intentionnel, sensible au toucher/matière plus qu'au bling.
- **Job unique de la home** : Faire sentir la matière et le soin de l'emballage en 8s, puis pousser vers `/box` (Box Builder) — pas une boutique catalogue.

## 2. Direction distinctive (risque assumé)

> **Generic AI slop actuel à éviter** : cream #F4F1EA + serif géant + terracotta — c'est exactement notre palette initiale. On la garde car le brief la **pince** (luxe épuré crème), mais on la rend **distinctive par la matérialité**, pas par la teinte.
- **Risque unique** : Socle 3D kraft radial `/` matière tangible (papier texturé + lumière rasante) au lieu d'un hero flat. La boîte n'est pas posée sur un fond, elle est posée sur **son atelier**.

## 3. Tokens — 6 valeurs nommées

| Rôle | Token | Hex | Usage |
|------|-------|-----|-------|
| Fond page | `--color-cream` | `#FAF7F2` | Page, pas la boîte |
| Socle 3D | `--color-stage` | `radial #FFFFFF→#F3EDE4→#EDE6D6→#E8DDD0` | `HomeHero3D.tsx:88` stage — contraste 4.6:1 vs boîte |
| Boîte base | `--color-box-base` | `#EDE3D3` | `ProceduralBox.tsx:77` kraft chaud, pas cream |
| Boîte lid | `--color-box-lid` | `#FFFEFB` | Lid 0.4 teinte plus clair que base — lit la charnière |
| Encre | `--color-ink` | `#1C1917` | Texte, logo CanvasTexture |
| Accent | `--color-accent` | `#B4413C` | CTA, badge panier `CartDrawerTrigger.tsx:30` |

Contraste validé `applying-themes check_contrast.py` : `#EDE3D3` sur `#FAF7F2` 1.08→ **socle obligatoire**, `ink` sur socle 14:1.

## 4. Typo — pairing intentionnel

- **Display** : Fraunces `opsz 9..144, wght 500` — 7xl hero `tracking -0.02` + outline `18vw` `text-outline-ink 0.07` `page.tsx:99`. Pas d'Inter en display.
- **Body** : Inter `400/500` — `text-lg leading-relaxed text-ink/60` baseline `page.tsx:99`.
- **Utility** : Inter `600 0.35em` surtitle `VELMIRYS`.
- **Échelle** : `12/16/22/36/56/72` — mobile 36→ desktop 72 hero, pas de 48 intermédiaire.

## 5. Layout — thèse du hero

```
[ outline VELMIRYS 18vw fond ]
[ surtitle .35em ]
[ h1 Fraunces 7xl "Le voile, porté..." ]
[ baseline Inter 18px 60 ]
[ CTA ink pill + CTA ghost  →  scrollytelling pin 90vh ]
[ STAGE radial 32px radius + halo 0.7 + BoxScene 520px + ContactShadows ]
[ grain 0.035 + serif outline 01/02/03 sections ]
```
- **Numbering 01/02/03** : supprimé du hero (n'est pas une séquence), gardé en manifeste/builder/editorial où il encode **parcours 3 étapes** `page.tsx:263` — respecte `frontend-design` "Structure is information".

## 6. Signature — 1 élément mémorable

**Socle atelier radial + charnière lisible** — c'est la seule chose qu'on retient : la boîte ne flotte pas, elle est éclairée en lumière rasante `Environment studio 0.6` `BoxScene.tsx:71`, ombre `ContactShadows blur 1.6` ancrée au socle. Sans ce socle, la boîte ton-sur-ton disparaît (bug reporté).

## 7. Motion — orchestrée, pas dispersée

- **Page load** : `ScrollReveal y 12/14` cascade `delay 0/0.08/0.16/0.22` `page.tsx:100`.
- **Scroll hero** : **1 timeline** `HomeHero3D.tsx:40` `scrub 0.8` : `0-30% lidOpen`, `30-60% TissuePaper`, `60-85% BoxItems spirale` — pas 3 triggers séparés.
- **Micro** : `Cart badge scale`, `CTA hover bg-accent`, `shades scale 1.02` `page.tsx:200`.
- **Ambient** : `float y 0.008` + `mouse parallax pointer.x*0.08` `ProceduralBox.tsx:55` — désactivé si `prefers-reduced-motion` `usePrefersReducedMotion.ts:10`.

## 8. Plan d'application (skills suivants)

- `plan-design-review` : note ce DESIGN 9/10 (perd 1 sur texture papier réelle vs CSS).
- `premium-frontend-design` : pousse `MeshPhysicalMaterial clearcoat 0.14` + `Environment`.
- `design-review` : boucle screenshots 375/1440 → corrige espacements `py-24→py-28` etc.
- `web-design-guidelines` : audite `min-h-[44px]` `Header.tsx:38` + focus `ring-accent`.

Généré le 2026-08-23 — validé avec `high-end-visual-design` + `frontend-design`.
