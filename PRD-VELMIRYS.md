# PRD — Site e-commerce VELMIRYS

| | |
|---|---|
| **Produit** | Site e-commerce VELMIRYS (foulards/hijabs + accessoires + box cadeaux personnalisées) |
| **Version** | 1.0 — V1 (sans paiement en ligne, checkout WhatsApp) |
| **Statut** | Cadrage validé — prêt pour design & développement |
| **Date** | 17 août 2026 |
| **Périmètre** | Produit web uniquement (UX, fonctionnalités, design, animations, architecture technique). Stratégie business/marketing hors périmètre. |

---

## Table des matières

1. [Vision & objectifs](#1-vision--objectifs)
2. [Décisions structurantes validées](#2-décisions-structurantes-validées)
3. [Arborescence & spécification des pages](#3-arborescence--spécification-des-pages)
4. [Parcours utilisateurs](#4-parcours-utilisateurs)
5. [Spécification — Box Builder](#5-spécification--box-builder)
6. [Spécification — Checkout WhatsApp](#6-spécification--checkout-whatsapp)
7. [Design system & animations 3D](#7-design-system--animations-3d)
8. [Exigences non-fonctionnelles](#8-exigences-non-fonctionnelles)
9. [Architecture technique & stack](#9-architecture-technique--stack)
10. [Gestion du catalogue (Sanity)](#10-gestion-du-catalogue-sanity)
11. [Modèle de données](#11-modèle-de-données)
12. [Évolutivité — préparation V2](#12-évolutivité--préparation-v2)
13. [Risques techniques & mitigations](#13-risques-techniques--mitigations)
14. [Backlog priorisé MVP / V2](#14-backlog-priorisé-mvp--v2)
15. [Plan de contenus à produire](#15-plan-de-contenus-à-produire)
16. [Coûts récurrents estimés](#16-coûts-récurrents-estimés)
17. [Annexe A — Récapitulatif du cadrage](#17-annexe-a--récapitulatif-du-cadrage)
18. [Annexe B — Pipeline de production de l'asset boîte 3D](#18-annexe-b--pipeline-de-production-de-lasset-boîte-3d)

---

## 1. Vision & objectifs

VELMIRYS vend des foulards/hijabs et accessoires dans un univers épuré, doux et premium (blancs, crèmes, pastels, packaging soigné). Le site doit :

1. **Incarner le haut de gamme** : niveau visuel et d'animation des sites primés (Awwwards), avec une page d'accueil immersive en 3D.
2. **Faire du Box Builder le cœur de l'expérience** : composer une box cadeau personnalisée doit être le moment le plus mémorable du site.
3. **Convertir sans friction** : achat simple ou box, checkout par redirection WhatsApp avec message pré-rempli (V1 sans paiement en ligne).
4. **Rester rapide partout** : wow effect **et** performance réelle, optimisé pour mobile modeste + 4G variable.
5. **Être prêt pour la V2** (paiement en ligne) sans refonte.

**Indicateurs de succès (produit)** : taux d'ajout au panier, taux de complétion du box builder, taux de clic "Commander sur WhatsApp", Lighthouse mobile ≥ 90, LCP < 2,5 s en 4G.

---

## 2. Décisions structurantes validées

| Domaine | Décision |
|---|---|
| Architecture | Hybride : accueil immersif 3D + parcours e-commerce classique |
| Catalogue | 15–40 SKU, administré via Sanity (CMS headless) |
| Variantes | Tuiles par coloris dans la grille → fiche unique par modèle, pré-sélectionnée |
| Box Builder | La box 3D se remplit en direct • 2 à 5 articles • prix = somme simple, emballage offert • message cadeau + choix de carte |
| Checkout | WhatsApp avec message structuré + référence `VEL-XXXX` • commande **enregistrée en base avant redirection** |
| Backend V1 | Routes API Next.js + Supabase (Postgres) + mini admin + notification email |
| Panier | Drawer latéral + page récapitulative • articles simples + multi-box |
| 3D | React Three Fiber • concept "Unboxing" (asset boîte mutualisé accueil/builder) • qualité adaptative auto sur mobile |
| DA | Luxe épuré éditorial + moments 3D concentrés • duo serif/sans-serif |
| Stack | Next.js (TS) + Tailwind + GSAP + Sanity + Supabase + Resend, hébergé sur DigitalOcean App Platform |
| Langues | Français uniquement, architecture i18n-ready (`next-intl`) |
| Devises | FCFA + EUR (double saisie des prix, sélecteur + géolocalisation) |
| Perf | Référence : mobile modeste + 4G variable |
| Anticipation | Schéma DB prêt pour comptes clientes + livraison par zone |

---

## 3. Arborescence & spécification des pages

### 3.1 Arborescence

```
/                        Accueil (immersif 3D)
/boutique                Boutique — grille + filtres
/boutique/[slug]         Fiche produit
/box                     Box Builder (cœur de l'expérience)
/a-propos                À propos / univers de marque
/contact                 Contact
/panier                  Page récapitulative (pré-checkout)
/commande/confirmation   Confirmation post-redirection WhatsApp
/admin                   Mini back-office commandes (protégé)
/legal/cgv               CGV
/legal/confidentialite   Politique de confidentialité
/legal/livraison-retours Livraison & retours
```

Panier drawer : présent sur toutes les pages via l'en-tête. Pages légales : contenu statique issu de Sanity (blocs texte).

### 3.2 Spécification par page

| Page | Objectif | Contenus clés | Animations / interactions |
|---|---|---|---|
| **Accueil** | Immersion, promesse de marque, aiguillage | Hero 3D "Unboxing" scrollytelling • manifeste court • sélection "Nos teintes" (tuiles coloris) • mise en avant Box Builder (CTA principal) • section éditoriale (photo lifestyle) • avis/réassurance • footer | Scène 3D pilotée au scroll (GSAP ScrollTrigger + R3F), reveals typographiques, smooth scroll Lenis |
| **Boutique** | Parcourir et choisir rapidement | Grille de tuiles (une par coloris) • filtres catégorie (Foulards / Bonnets / Épingles) • tri (nouveautés, prix) • badge "Épuisé" | Reveal au scroll en cascade légère, hover : zoom image doux + nom/prix, skeleton loading |
| **Fiche produit** | Convaincre et déclencher l'ajout | Galerie (packshot + porté) • sélecteur de coloris (swatches) • prix FCFA/EUR • description, matière, entretien • CTA "Ajouter au panier" + CTA secondaire "Ajouter à une box" • suggestions ("Se combine avec") | Transition d'image au changement de coloris, sticky CTA mobile, ajout animé vers le drawer |
| **Box Builder** | Composer une box cadeau (cf. §5) | Galerie d'articles + scène 3D de la boîte • compteur 2–5 • étape personnalisation • récap | La box 3D se remplit en direct, particules/confettis papier à la complétion |
| **À propos** | Incarner la marque | Histoire, valeurs, photos lifestyle, qualité des tissus | Scrollytelling léger, images en parallax |
| **Contact** | Rassurer, rediriger | Bouton WhatsApp principal • email • Instagram/TikTok • FAQ courte (5–7 questions) | Micro-interactions discrètes |
| **Panier (page)** | Relire avant de commander | Lignes articles + box détaillées • modification quantités • suppression • formulaire client (nom, téléphone, zone) • total • CTA "Commander sur WhatsApp" | Transitions douces sur ajout/suppression, validation de formulaire inline |
| **Confirmation** | Clore la boucle | Récap de la référence `VEL-XXXX` • bouton "Rouvrir WhatsApp" • retour boutique | Animation de la boîte qui se ferme (réutilisation asset) |
| **Admin** | Suivre les commandes | Liste commandes (statut, réf, client, total, date) • détail commande • changement de statut | Aucune (outil interne) |

---

## 4. Parcours utilisateurs

### 4.1 Parcours A — Achat simple

1. **Arrivée** (lien Instagram/WhatsApp → accueil ou fiche produit directe).
2. Accueil : scrollytelling d'ouverture de la boîte → section teintes → la cliente tape un coloris.
3. Fiche produit pré-sélectionnée sur ce coloris → galerie → "Ajouter au panier".
4. Drawer panier s'ouvre (confirmation + suggestion complémentaire, ex. épingles).
5. Clic "Voir mon panier" → page récapitulative.
6. Formulaire : nom & prénom, téléphone, zone de livraison → validation inline.
7. Clic "Commander sur WhatsApp" → `POST /api/orders` (enregistrement, statut `en_attente`, génération référence) → redirection `wa.me` avec message pré-rempli.
8. La cliente envoie le message → confirmation et paiement manuels dans la conversation.
9. Page confirmation : référence affichée + bouton "Rouvrir WhatsApp" (si l'utilisatrice a fermé l'onglet).

### 4.2 Parcours B — Composition de box

1. Entrée par CTA "Composer votre box" (accueil, navigation, fiche produit, boutique).
2. Box Builder : la boîte 3D ouverte est visible ; la galerie d'articles est filtrable.
3. Chaque ajout → l'article vole dans la boîte (animation), compteur "2/5 articles".
4. Quand ≥ 2 articles : bouton "Personnaliser ma box" actif.
5. Étape personnalisation : message cadeau (250 car.) + choix de la carte (2–3 designs, aperçu).
6. Prévisualisation finale : la boîte se ferme en 3D + panneau récap (contenu, prix, message, carte).
7. "Ajouter la box au panier" → drawer (la box apparaît comme une ligne détaillée).
8. Possibilité de composer une **seconde box** ou d'ajouter des articles simples (multi-box acté).
9. Suite identique au parcours A (étapes 5–9). Le message WhatsApp détaille chaque box.

### 4.3 Cas particuliers

| Cas | Comportement |
|---|---|
| Article devient épuisé pendant la session | Badge "Épuisé" au retour sur la grille ; ligne marquée "indisponible" dans le panier, exclue du total, proposition de la retirer |
| Box incomplète quittée | Brouillon conservé en `localStorage` (7 jours), reprise via bannière "Reprendre ma box" |
| Fermeture avant envoi WhatsApp | Commande déjà en base (`en_attente`) → relançable manuellement ; page confirmation permet de rouvrir WhatsApp |
| WhatsApp non installé (desktop) | `wa.me` ouvre WhatsApp Web ; bouton "copier le message" en secours |
| Modification d'une box depuis le panier | "Modifier" rouvre le builder avec la box pré-chargée |
| Multi-box | Chaque box = entité propre (contenu, message, carte), listée "Box n°1, n°2…" dans le récap et le message |

---

## 5. Spécification — Box Builder

### 5.1 Scénario étape par étape

| Étape | Écran | Contenu & interactions |
|---|---|---|
| **0. Intro** | Ouverture du builder | Titre "Composez votre box" • la boîte VELMIRYS 3D s'ouvre (animation) • sous-titre "Choisissez 2 à 5 articles — l'emballage cadeau est offert" |
| **1. Sélection** | Galerie + scène 3D | Grille d'articles filtrable (catégorie, coloris) ; bouton "+" sur chaque tuile → l'article (stylisé, couleur exacte) **vole dans la boîte 3D** ; compteur `n/5` ; possibilité de retirer depuis la boîte ou la liste |
| **2. Personnalisation** | Panneau latéral / étape plein écran mobile | Message cadeau : textarea 250 car., compteur, aperçu typographié • choix de la carte : 2–3 designs (visuels réels des cartes VELMIRYS) |
| **3. Prévisualisation** | Scène 3D + récap | La boîte se ferme (couvercle + papier de soie) • panneau récapitulatif : contenu, quantités, prix unitaires, total, message, carte choisie |
| **4. Ajout au panier** | Drawer | La box apparaît comme ligne détaillée • CTA "Composer une autre box" / "Voir mon panier" |

### 5.2 Règles métier

| Règle | Spécification |
|---|---|
| Composition | **Libre, 2 à 5 articles**, toutes catégories (foulards, bonnets, épingles), doublons autorisés (ex. 2 foulards) |
| Prix | **Somme simple des articles** ; emballage (boîte, papier de soie, carte) **offert** — mention affichée "Emballage cadeau offert" |
| Compatibilité | Aucune exclusion entre articles en V1 |
| Message cadeau | Texte libre, 250 caractères max, optionnel ; imprimé sur la carte choisie |
| Carte | Choix obligatoire parmi 2–3 designs (défaut : design "Thank You" floral existant) |
| Stock | Même disponibilité que la boutique (interrupteur Sanity) ; article épuisé non ajoutable |
| Brouillon | Sauvegarde automatique `localStorage`, expiration 7 jours |
| Multi-box | Plusieurs box par commande ; chaque box nommée "Box n°1, n°2…" |

### 5.3 Exigences 3D du builder

- **Une seule scène WebGL** réutilisant l'asset boîte de l'accueil (mutualisation actée).
- Articles stylisés : foulards = plans texturés couleur exacte avec plis procéduraux légers ; bonnets = formes simplifiées ; coffrets épingles = boîtes miniatures. **Pas de modélisation individuelle réaliste** (perf).
- Animations : trajectoire "vol" courbée (0,6 s, easing GSAP), réception dans la boîte avec rebond doux, papier de soie qui se resserre à chaque ajout.
- Scène bornée : ≤ 150 Ko de géométrie, textures KTX2/Basis compressées, DPR plafonné à 1,5 sur mobile.
- **Fallback 2.5D automatique** (cf. §7.4) : la boîte devient une illustration animée GSAP ; les articles "glissent" dedans en 2D. Fonctionnalité strictement identique.

---

## 6. Spécification — Checkout WhatsApp

### 6.1 Flux technique

1. Page `/panier` : récapitulatif complet (articles, box détaillées, quantités, prix, total dans la devise choisie).
2. Formulaire : **nom & prénom**, **téléphone**, **zone de livraison** (validation : champs requis, format téléphone international).
3. Clic "Commander sur WhatsApp" :
   - `POST /api/orders` → validation serveur (prix recalculés côté serveur depuis Sanity — jamais de confiance au client), création en base, statut `en_attente`, génération référence **`VEL-XXXX`** (4 caractères alphanumériques, unicité vérifiée).
   - Notification email à la boutique (Resend) avec le détail.
   - Réponse : référence + URL `https://wa.me/<NUMERO_BOUTIQUE>?text=<message encodé>`.
4. Redirection vers WhatsApp (nouvel onglet) → page `/commande/confirmation?ref=VEL-XXXX`.
5. La boutique confirme disponibilité, livraison et paiement **dans la conversation** ; statuts gérés dans le mini admin.

### 6.2 Message pré-rempli — contenu exact

> Le message est généré côté serveur (à partir de la commande en base), URL-encodé, sauts de ligne `%0A`. Devise = celle choisie par la cliente. Numéro de la boutique au format international sans `+` (ex. `22177XXXXXXX`).

```
Bonjour VELMIRYS ! 🤍
Je souhaite confirmer ma commande — Réf : VEL-4K2X

👤 Mes informations
• Nom : Awa Diop
• Téléphone : +221 77 000 00 00
• Zone de livraison : Dakar — Almadies

🛍️ Ma commande
• Foulard Jersey Premium — Rose poudré ×1 — 12 000 FCFA
• Coffret Épingles à hijab — Tons pastel ×1 — 6 500 FCFA

🎁 Box cadeau n°1 — 24 500 FCFA
   • Foulard Jersey Premium — Bleu ardoise ×1
   • Bonnet sous-hijab — Noir ×1
   • Carte : « Thank You » (design floral)
   • Message : « Joyeux anniversaire ma sœur, tu mérites le plus beau 🤍 »

💰 Total : 43 000 FCFA
🚚 Livraison : à confirmer ensemble

Merci !
```

Règles de composition du message :

- Articles simples d'abord, puis chaque box numérotée avec son sous-total, sa carte et son message.
- Prix formatés avec espace insécable comme séparateur de milliers ; devise suffixée (`FCFA`) ou préfixée (`€`) selon la devise.
- Si le message cadeau est vide → ligne omise.
- Longueur maximale surveillée (< 4 000 caractères ; largement suffisant pour 5 articles × n box).
- Bouton de secours "**Copier le message**" sur la page de confirmation.

### 6.3 Données côté client

| Donnée | Stockage | Durée |
|---|---|---|
| Panier (articles + box + brouillon builder) | `localStorage` | 30 jours (brouillon box : 7 jours) |
| Devise choisie | `localStorage` | Persistante |
| Infos formulaire | Jamais stockées en clair côté client ; transmises au serveur à la commande uniquement | — |

---

## 7. Design system & animations 3D

### 7.1 Direction artistique

**Positionnement** : luxe épuré éditorial, rehaussé de moments 3D concentrés (accueil, box builder). Beaucoup de blanc, une typographie serif expressive, une photographie généreuse.

**Références** (à intégrer au moodboard) :

| Référence | Ce qu'on en retient |
|---|---|
| **Aesop / The Row / Loro Piana** | Structure épurée, espace blanc, typographie éditoriale, discrétion des animations |
| **Jacquemus / Rimowa** | Pages produit premium, audace visuelle maîtrisée |
| **Pages produit Apple** | Scrollytelling produit piloté au scroll, sobriété |
| **Gucci Vault / sites de studios (Locomotive, Lusion, Active Theory)** | Immersion 3D, transitions cinéma, micro-interactions |
| **Bruno Simon (portfolio)** | Référence technique WebGL ludique et performante |

### 7.2 Design tokens (à affiner avec la charte fournie)

| Token | Valeur indicative | Usage |
|---|---|---|
| `--cream` | `#FAF7F2` | Fond principal |
| `--sand` | `#F3EDE4` | Fonds alternés, cartes |
| `--ink` | `#1C1917` | Texte principal |
| `--blush` | `#E8C4C4` | Pastel — rose poudré |
| `--slate` | `#3E4C63` | Pastel — bleu ardoise |
| `--choco` | `#5C3A2E` | Pastel — chocolat |
| `--wine` | `#4A1F24` | Pastel — bordeaux |
| `--mauve` | `#9B7E8C` | Pastel — mauve |
| `--accent` | `#B4413C` | Accent (repris de la carte "Thank You") — CTA, badges |

**Typographie** : titres en serif éditorial — **Fraunces** (variable, gratuite) ou **Canela/Ogg** si licence ; corps en **Inter** (ou Neue Haas si licence). Échelle : 12 / 14 / 16 / 18 / 24 / 32 / 48 / 72 px. Interlettrage négatif léger sur les grands titres.

**Grille & espacement** : grille 12 colonnes desktop, 4 mobile ; espacements en multiples de 8 px ; coins arrondis 8–16 px ; ombres très douces.

### 7.3 Scène 3D d'accueil — "Unboxing"

Timeline pilotée au scroll (GSAP ScrollTrigger + React Three Fiber) :

| Séquence | Scroll | Action |
|---|---|---|
| 1. Attente | 0 % | Boîte blanche brandée fermée, centrée, lumière studio douce, ombre portée subtile, léger flottement |
| 2. Ouverture | 0–25 % | Le couvercle pivote et s'ouvre ; halo de lumière chaude |
| 3. Papier de soie | 25–50 % | Le papier de soie brandé se déplie (plans animés par shader/vertex) |
| 4. Envol des teintes | 50–75 % | 6 tissus stylisés (couleurs exactes du catalogue) s'envolent et orbitent doucement autour de la boîte |
| 5. Transition | 75–100 % | Les tissus se rangent en palette horizontale → fondu vers la section "Nos teintes" (grille boutique) |

Contraintes : **une seule scène** ; géométrie ≤ 500 Ko (Draco) ; textures KTX2 ; DPR plafonné (2 desktop / 1,5 mobile) ; chargement différé (`dynamic import`, la scène n'est pas dans le bundle initial) ; éclairage précalculé (pas de shadow maps temps réel coûteuses).

### 7.4 Qualité adaptative (mobile & connexions lentes)

Détection à l'initialisation, score combiné :

| Signal | Source |
|---|---|
| Mémoire appareil | `navigator.deviceMemory` |
| Cœurs CPU | `navigator.hardwareConcurrency` |
| GPU | `WEBGL_debug_renderer_info` (renderer string) |
| Réseau | `navigator.connection.effectiveType` + `saveData` |

| Tier | Comportement |
|---|---|
| **High** | 3D temps réel complète (accueil + builder), smooth scroll, toutes les animations |
| **Low** (ou `prefers-reduced-motion`, ou `saveData`) | Fallback 2.5D : séquence d'images/vidéo courte compressée ou illustration animée GSAP ; fonctionnalité identique, wow réduit mais élégant |

### 7.5 Transitions & micro-interactions (pages internes)

- Transitions de pages : fondu + translation verticale courte (300–400 ms), via GSAP ; pas de 3D continue hors accueil/builder.
- Smooth scroll Lenis (désactivé si `prefers-reduced-motion`).
- Reveals au scroll : images (masque qui se lève) + titres (lignes qui montent), stagger léger.
- Hover states : zoom image 1,03, soulignés animés, curseur personnalisé discret sur desktop uniquement.
- Ajout au panier : micro-animation de la tuile qui "saute" vers l'icône panier, badge compteur animé.
- Skeletons de chargement sur boutique et fiches.

---

## 8. Exigences non-fonctionnelles

### 8.1 Performance (référence : mobile modeste + 4G variable)

| Métrique | Cible |
|---|---|
| Lighthouse mobile (Perf) | ≥ 90 |
| LCP (4G) | < 2,5 s |
| INP | < 200 ms |
| CLS | < 0,05 |
| Poids initial (HTML+CSS+JS critique) | ≤ 1,5 Mo (scène 3D **hors** bundle initial, chargée en différé) |
| Images | WebP/AVIF via CDN Sanity, `srcset` responsive, lazy-load hors viewport |
| Budgets CI | Vérifiés à chaque build (bundlesize / Lighthouse CI) |

Techniques : SSG/ISR Next.js pour toutes les pages catalogue ; code splitting par route ; fonts auto-hébergées `font-display: swap` ; préchargement critique minimal.

### 8.2 Accessibilité — WCAG 2.1 AA

- Contrastes AA (texte ≥ 4,5:1) ; focus visible partout ; navigation clavier complète (y compris builder et drawer) ; `aria-labels` sur les contrôles d'icônes ; `prefers-reduced-motion` respecté (fallback statique/2D) ; alternatives textuelles à toutes les images ; la scène 3D n'est jamais l'unique porteuse d'information.

### 8.3 SEO (technique — trafic réseaux sociaux d'abord)

- Metadata complètes par page ; **OG images dynamiques** (fiches produit : visuel + nom + prix) — cruciales pour les partages WhatsApp/Instagram ; sitemap.xml + robots.txt ; données structurées `Product` (JSON-LD) ; URLs propres (`/boutique/foulard-jersey-premium`) ; canonical ; pas de blog en V1 (structure extensible).

### 8.4 Responsive & compatibilité

- Mobile-first ; breakpoints : 360 / 768 / 1024 / 1440 px ; cible de test principale : mobile Android milieu de gamme (ex. Chrome sur 4 Go RAM) + iPhone Safari.
- Navigateurs : 2 dernières versions Chrome, Safari, Firefox, Edge ; Samsung Internet.

### 8.5 Sécurité & vie privée

- Admin protégé (Supabase Auth, lien magique, compte unique) ; API `POST /api/orders` avec validation serveur + rate limiting + honeypot anti-spam ; secrets en variables d'environnement ; RGPD : bandeau léger (pas de cookies tiers par défaut), page confidentialité, analytics respectueux (**Umami** auto-hébergé sur DO, sans cookies).

---

## 9. Architecture technique & stack

### 9.1 Stack validée

| Couche | Choix | Rôle |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/SSG/ISR, routes API, une seule codebase front+back |
| UI | **Tailwind CSS** | Design system rapide à maintenir |
| 3D | **React Three Fiber + drei** | Scènes accueil & builder (asset boîte mutualisé) |
| Animations | **GSAP + ScrollTrigger**, **Lenis** | Scrollytelling, transitions, micro-interactions |
| État client | **Zustand** | Panier, builder, devise (persistés en localStorage) |
| CMS catalogue | **Sanity** | Produits, coloris, prix FCFA/EUR, disponibilité, contenus éditoriaux, cartes cadeaux |
| BDD commandes | **Supabase (Postgres)** | Commandes, clients (anticipation), zones de livraison |
| Emails | **Resend** | Notification de commande à la boutique |
| i18n | **next-intl** | FR en V1, EN ajoutable sans refonte |
| Analytics | **Umami** (auto-hébergé DO) | Stats respectueuses de la vie privée |
| Hébergement | **DigitalOcean App Platform** | PaaS managé, crédits existants, HTTPS, déploiement Git |
| CI/CD | GitHub Actions | Lint, typecheck, tests, budgets perf, déploiement |

### 9.2 Architecture logique

```
[Cliente] → [Next.js sur DO App Platform]
              ├── Pages SSG/ISR (catalogue depuis Sanity, webhook de revalidation)
              ├── /api/orders → Supabase (commandes) + Resend (email)
              └── /admin (protégé Supabase Auth) → lecture/gestion commandes
[Oumou]   → [Sanity Studio] (catalogue, prix, stocks, contenus)
          → [Mini admin] (commandes)
          → [WhatsApp Business] (confirmation + paiement manuel)
```

- **Revalidation** : webhook Sanity → revalidation ISR des pages impactées (produit modifié visible en quelques secondes).
- **Prix** : source de vérité = Sanity ; le serveur recalcule toujours les totaux à la commande.

### 9.3 Outillage MCP (développement)

| MCP | Rôle | Quand |
|---|---|---|
| GitHub (officiel) | Repo, issues du backlog, PR, suivi CI | Setup |
| Supabase (officiel) | Schéma BDD, migrations, inspection des données | Setup |
| Sanity (officiel) | Schémas contenus, requêtes GROQ, seed | Setup |
| Playwright (officiel, Microsoft) | Tests e2e parcours A/B, captures multi-viewports | Dev |
| Context7 (Upstash) | Documentation à jour (Next.js, R3F, GSAP, Tailwind) | Dev |
| Chrome DevTools (officiel, Google) | Audits perf Lighthouse, vérification budget §8.1 | QA |
| Blender (communautaire, `blender-mcp`) | Production de l'asset boîte (cf. §18) | Asset 3D |
| DigitalOcean (officiel) | App Platform : déploiements, logs, variables d'env | Déploiement |

⚠️ Sécurité : tokens à scopes limités (lecture seule en dev), environnements dev/prod séparés. **Décision client actée : aucun MCP supplémentaire pour la V2** (Stripe, Sentry, WhatsApp Business exclus du périmètre d'outillage).

---

## 10. Gestion du catalogue (Sanity)

### 10.1 Schémas de contenu

| Schéma | Champs clés |
|---|---|
| `product` | titre, slug, catégorie (foulard / bonnet / épingle), description, matière, entretien, `priceXof`, `priceEur`, variantes[] (nom coloris, hex, images[], sku, `inStock`), mise en avant (accueil), seo |
| `cardDesign` | nom, visuel, aperçu, ordre, actif |
| `collection` (accueil) | sélection de produits/coloris pour "Nos teintes" |
| `siteSettings` | numéro WhatsApp, zones de livraison affichées, messages types, liens sociaux |
| `page` (blocs) | à propos, contact, pages légales, FAQ |

### 10.2 Processus d'administration (Oumou, autonome)

1. Connexion à Sanity Studio (URL dédiée, gratuit).
2. Ajouter un produit : titre, catégorie, prix FCFA + EUR, puis une **variante par coloris** (nom, couleur, photos, interrupteur "En stock").
3. Épuisé → basculer l'interrupteur du coloris ; le site badge "Épuisé" et bloque l'ajout (boutique + builder) en quelques secondes (webhook).
4. Images : glisser-déposer ; recadrage/format/optimisation automatiques via le CDN Sanity.
5. Designs de cartes, contenus éditoriaux et pages légales : éditables dans Sanity.

**Pas de stock quantitatif en V1** : disponibilité binaire + confirmation manuelle sur WhatsApp (philosophie du flux actée).

---

## 11. Modèle de données

### 11.1 Panier côté client (TypeScript)

```ts
type CartLine =
  | { kind: "product"; productId: string; variantId: string; qty: number }
  | {
      kind: "box";
      boxId: string;
      items: { productId: string; variantId: string; qty: number }[]; // 2 à 5
      giftMessage?: string;   // ≤ 250 car.
      cardDesignId: string;
    };
```

### 11.2 Base Supabase (SQL simplifié)

```sql
customers      (id, full_name, phone, delivery_zone, created_at)          -- anticipation comptes
orders         (id, ref text unique, customer_id, status,                 -- en_attente|confirmee|payee|expediee|livree|annulee
                currency, subtotal, total, payload jsonb, created_at)
order_items    (id, order_id, parent_box_id null, product_id, variant_id, qty, unit_price)
boxes          (id, order_id, gift_message, card_design_id)
delivery_zones (id, name, fee_xof, fee_eur, active)                        -- anticipation livraison par zone
```

`payload` (jsonb) : copie figée de la commande telle qu'affichée dans WhatsApp (résiste aux changements de catalogue ultérieurs).

---

## 12. Évolutivité — préparation V2

| Évolution V2+ | Déjà en place grâce à la V1 | Reste à faire en V2 |
|---|---|---|
| **Paiement en ligne** | Table `orders` + statuts + prix recalculés serveur ; **abstraction provider** (`PaymentProvider` interface) | Implémenter provider local mobile money (PayDunya / PayTech / Wave) pour FCFA et/ou Stripe pour EUR ; webhooks de confirmation ; page paiement |
| **Comptes clientes** | Table `customers` + liaison commandes | Auth (Supabase Auth), espace "Mes commandes", adresses sauvegardées |
| **Livraison par zone** | Table `delivery_zones` | Calcul automatique des frais au checkout, mise à jour du message WhatsApp |
| **Notifications auto** | Statuts normalisés | Intégration API WhatsApp Business (gabarits validés Meta) |
| **Anglais** | `next-intl` intégré | Fichiers de traduction EN + sélecteur + hreflang |
| **Blog / SEO éditorial** | Sanity extensible | Schéma `article`, routes `/journal` |

**Règle d'architecture V1** : aucune donnée de commande ne vit uniquement côté client ; aucun appel direct à un provider de paiement depuis le front — tout passe par les routes API.

---

## 13. Risques techniques & mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| 3D saccadée sur mobile bas de gamme | Élevée | Élevé | Qualité adaptative (§7.4) + fallback 2.5D + DPR plafonné + géométrie bornée + scène hors bundle initial |
| Redirection WhatsApp bloquée (desktop, app absente) | Moyenne | Moyen | `wa.me` ouvre WhatsApp Web ; page confirmation avec bouton "Rouvrir WhatsApp" + "Copier le message" ; commande déjà en base |
| Prix manipulés côté client | Moyenne | Élevé | Recalcul serveur systématique depuis Sanity à la création de commande |
| Indisponibilité Sanity | Faible | Moyen | Pages générées en SSG/ISR : le site reste en ligne sur le dernier build |
| Poids des photos (site très visuel) | Élevée | Élevé | CDN Sanity (AVIF/WebP, srcset), lazy-load, budgets CI bloquants |
| Incohérence FCFA/EUR | Moyenne | Moyen | Double saisie manuelle (pas de taux auto) = contrôle total ; tests e2e sur les deux devises |
| Spam de l'API commandes | Moyenne | Moyen | Rate limiting + honeypot + validation stricte |
| Scope creep des animations | Moyenne | Élevé | Backlog priorisé (§14) : le builder et l'accueil d'abord, micro-interactions ensuite |
| Multi-box mal compris | Moyenne | Faible | Numérotation explicite "Box n°1…" dans panier, récap et message ; test utilisateur sur prototype |

---

## 14. Backlog priorisé MVP / V2

### MVP (V1)

| # | Feature | Priorité | Effort |
|---|---|---|---|
| 1 | Setup Next.js + Tailwind + design tokens + typo | P0 | S |
| 2 | Schémas Sanity (produits, variantes, cartes, settings) + Studio | P0 | M |
| 3 | Boutique : grille tuiles coloris + filtres catégorie | P0 | M |
| 4 | Fiche produit : galerie, swatches, CTA panier + "ajouter à une box" | P0 | M |
| 5 | Panier : drawer + page récap + multi-box | P0 | M |
| 6 | Checkout WhatsApp : formulaire, API commandes, message, confirmation | P0 | M |
| 7 | Accueil : scène 3D Unboxing + sections éditoriales | P0 | L |
| 8 | Box Builder : scène 3D, sélection, personnalisation, preview | P0 | L |
| 9 | Qualité adaptative + fallback 2.5D | P0 | M |
| 10 | Mini admin commandes + notification email (Resend) | P0 | M |
| 11 | Multi-devise FCFA/EUR (sélecteur + géoloc + double saisie) | P0 | M |
| 12 | À propos, Contact (+ FAQ), pages légales | P1 | S |
| 13 | SEO technique (metadata, OG dynamiques, sitemap, JSON-LD) | P1 | S |
| 14 | Accessibilité AA + `prefers-reduced-motion` | P1 | M |
| 15 | Analytics Umami + CI budgets perf + tests e2e checkout | P1 | M |
| 16 | i18n-ready (next-intl, FR) | P1 | S |

### V2 (post-lancement, par ordre suggéré)

| # | Feature | Dépendance |
|---|---|---|
| 1 | Paiement en ligne : provider mobile money FCFA (PayDunya/PayTech/Wave) et/ou Stripe EUR | Interface `PaymentProvider` V1 |
| 2 | Comptes clientes + historique commandes | Table `customers` V1 |
| 3 | Livraison par zone avec calcul automatique | Table `delivery_zones` V1 |
| 4 | Notifications WhatsApp automatiques (API Business) | Statuts normalisés V1 |
| 5 | Version anglaise | next-intl V1 |
| 6 | Journal / contenu SEO | Sanity |
| 7 | Fidélité / parrainage | Comptes clientes |

---

## 15. Plan de contenus à produire

| Contenu | Statut | Responsable | Note |
|---|---|---|---|
| Photos packshots (fond clair, cadrage uniforme) | ✅ Disponibles | — | Vérifier cohérence lumière/cadrage entre toutes les références |
| Photos lifestyle | ✅ Disponibles | — | Réserver aux sections éditoriales (accueil, à propos) |
| Logo vectoriel + charte | ✅ Disponibles | — | Intégrer couleurs/typos exactes aux design tokens |
| Textes FR (descriptions produits, à propos, FAQ, légales, messages carte/WhatsApp) | 🟡 **Rédigés dans `contenus/` — en attente de validation** | Agent + validation client | Infos factuelles à confirmer via `CONTENUS-A-FOURNIR.md` |
| Visuels des 2–3 designs de cartes cadeaux | ⚠️ À décliner | — | Déclinaison de la carte "Thank You" existante |
| Modèle 3D de la boîte (glTF) | ❌ À produire | Dev 3D | Un seul asset mutualisé accueil + builder — pipeline détaillé en §18 |

---

## 16. Coûts récurrents estimés

| Poste | V1 (lancement) | À l'échelle |
|---|---|---|
| Hébergement DO App Platform | ~5–12 $/mois **déduits des crédits** (≈ 0 € cash) | idem ou + selon trafic |
| Sanity (CMS) | 0 € (free tier) | ~15 €/mois si dépassement |
| Supabase | 0 € (free tier) | ~25 €/mois (Pro) |
| Resend (emails) | 0 € (3 000/mois) | ~20 €/mois |
| Umami (analytics, auto-hébergé) | 0 € (dans les crédits DO) | idem |
| Domaine | ~1 €/mois | idem |
| **Total** | **≈ 1 €/mois cash** | **≈ 60–80 €/mois** |

---

## 17. Annexe A — Récapitulatif du cadrage

| # | Décision | Choix |
|---|---|---|
| A1 | Architecture | Hybride : accueil immersif + e-commerce classique |
| A2 | Arborescence | Complète (9 routes + drawer panier) |
| A3 | Panier | Drawer latéral + page récapitulative |
| B1 | Catalogue | 15–40 SKU |
| B2 | Variantes | Tuiles par coloris → fiche unique pré-sélectionnée |
| B3 | Admin | Sanity |
| C1 | Builder | La box 3D se remplit en direct |
| C2 | 3D builder | Stylisée + fallback 2.5D auto |
| C3 | Personnalisation | Message cadeau + choix de carte |
| C4 | Composition | Libre, 2–5 articles |
| C5 | Prix box | Somme simple, emballage offert |
| D1 | Données client | Nom & prénom + téléphone + zone de livraison |
| D2 | Message | Texte structuré + référence `VEL-XXXX` |
| D3 | Commande | Panier mixte + multi-box |
| E1 | Concept accueil | Unboxing au scroll (asset mutualisé) |
| E2 | Pages internes | Animations riches mais modulées |
| E3 | Mobile | Qualité adaptative automatique |
| E4 | Backend | API commandes + mini admin + notif email |
| E5 | DA | Luxe épuré éditorial + moments 3D • duo serif/sans-serif |
| F1–F3 | Stack | Next.js + Supabase + DO App Platform |
| G1 | Langues | FR, i18n-ready |
| G2 | Devise | FCFA + EUR |
| G3 | Contenus | Photos/logo ✅ — textes à produire |
| H1 | Perf | Référence mobile modeste + 4G variable |
| H2 | SEO | Technique, réseaux sociaux d'abord |
| I1 | Anticipation | Comptes clientes + livraison par zone |

---

## 18. Annexe B — Pipeline de production de l'asset boîte 3D

### 18.1 Options de production comparées

| Option | Qualité | Poids / perf | Coût & délai | Verdict |
|---|---|---|---|---|
| **Modélisation en code (primitives R3F)** — `RoundedBox` (drei) pour corps et couvercle, logo en texture sur plan, papier de soie = plans animés par shader | Bonne (objet épuré) | ⭐ Optimale (zéro asset à télécharger) | 0 €, quelques heures de dev | Prototype |
| **Modélisation Blender → export GLB** — épaisseur de carton réelle, micro-grain, logo embossé sur le couvercle | ⭐ Maximale (réalisme premium) | Très bonne après optimisation (≤ 300–500 Ko) | 0 € en DIY (Blender gratuit) ou 150–500 € freelance ; 1–2 jours | ✅ Version finale |
| **Photogrammétrie** (scan de la boîte réelle, Polycam / KIRI) | Fidèle mais topology sale | ❌ Maillage lourd à retoucher | Temps de nettoyage excessif pour un objet aussi simple | Écartée |
| **Génération IA** (Meshy, Tripo) | Imprévisible, textures approximatives | Moyenne | Rapide | Prototypage uniquement, pas pour du premium |

### 18.2 Workflow retenu (Blender → GLB)

1. **Modélisation** : corps + couvercle en 2 nœuds séparés (`Box_Base`, `Box_Lid`), épaisseur via Solidify, bords biseautés 2–3 mm, dimensions réelles (ex. 30 × 20 × 10 cm).
2. **Textures** : carton blanc à grain subtil (1024 px suffit) ; logo SVG existant → export PNG appliqué sur le couvercle (et intérieur brandé si souhaité).
3. **Ne PAS modéliser** : le papier de soie (plans + vertex shader dans Three.js, bien plus fluide à animer) ni les articles (stylisés en code, cf. §5.3).
4. **Ne PAS baker les animations** : le pivot du couvercle est animé en code (groupe Three.js, pivot à la charnière arrière) — l'ouverture est pilotée au scroll sur l'accueil et déclenchée à l'ajout d'article dans le builder.
5. **Export glTF/GLB + optimisation** : `gltf-transform optimize` (Draco pour la géométrie, KTX2/Basis pour les textures). Vérification visuelle sur `gltf.report`.
6. **Intégration R3F** : `useGLTF` + decoder Draco, chargement différé hors bundle initial (cf. §8.1).

### 18.3 Spec de livraison de l'asset

- GLB ≤ 500 Ko compressé, matériaux PBR (`MeshStandardMaterial`)
- Nœuds nommés : `Box_Base`, `Box_Lid` (pivot à la charnière arrière)
- Échelle réelle, origine au centre de la base
- **Un seul asset mutualisé** : accueil (état fermé → ouverture au scroll) et builder (état ouvert, se remplit)

### 18.4 Stratégie de production

Prototype animé **en code d'abord** (option 1) pour valider les animations dès le setup ; production de l'asset Blender **en parallèle** (option 2). L'interface du composant React ne change pas — seul le contenu visuel est swappé. Le MCP Blender (§9.3) peut piloter la modélisation.

---

*Document vivant — toute modification de scope doit mettre à jour les sections 3, 5, 6 ou 14 concernées.*
