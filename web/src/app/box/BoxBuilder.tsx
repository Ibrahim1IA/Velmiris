"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useBoxDraft, type DraftItem } from "@/store/boxDraft";
import { useCart } from "@/store/cart";
import { useCurrency } from "@/store/currency";
import { formatPrice } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";
import FlyingItem from "@/components/box/FlyingItem";
import BoxMiniSticky from "@/components/box/BoxMiniSticky";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { track } from "@/lib/analytics";

const BoxScene = dynamic(() => import("@/components/box/BoxScene"), { ssr: false });

type ProductVariant = {
  _key: string;
  colorName: string;
  hex: string;
  sku?: string;
  inStock: boolean;
};

type Product = {
  _id: string;
  title: string;
  slug: { current: string };
  category: "foulard" | "bonnet" | "epingle";
  priceXof: number;
  priceEur: number;
  priceGnf: number;
  variants: ProductVariant[];
};

type CardDesign = {
  _id: string;
  name: string;
  image: unknown;
  order: number;
  active: boolean;
};

type Props = {
  products: Product[];
  cards: CardDesign[];
  giftExamples: string[];
  initialAdd: string | null;
};

type Step = "select" | "customize" | "preview";

export default function BoxBuilder({ products, cards, giftExamples, initialAdd }: Props) {
  const router = useRouter();
  const { items, giftMessage, cardDesignId, addItem, removeItem, setGiftMessage, setCard, clear } = useBoxDraft();
  const addBox = useCart((s) => s.addBox);
  const currency = useCurrency((s) => s.currency);
  const [step, setStep] = useState<Step>("select");
  const [flying, setFlying] = useState<{ hex: string; draft: DraftItem; key: number } | null>(null);
  const [category, setCategory] = useState<"all" | "foulard" | "bonnet" | "epingle">("all");
  const [showConfetti, setShowConfetti] = useState(false);
  const [lidAnim, setLidAnim] = useState(1); // 1 ouvert par défaut (builder)
  const [hydrated, setHydrated] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard
    setHydrated(true);
  }, []);

  // initialAdd ?add=productId:variantId depuis fiche produit
  useEffect(() => {
    if (!hydrated || !initialAdd) return;
    const [pid, vid] = initialAdd.split(":");
    if (!pid || !vid) return;
    const p = products.find((pr) => pr._id === pid);
    const v = p?.variants.find((va) => va._key === vid);
    if (p && v && v.inStock) {
      const draft: DraftItem = {
        productId: p._id,
        variantId: v._key,
        hex: v.hex,
        category: p.category,
        title: p.title,
        colorName: v.colorName,
        priceXof: p.priceXof,
        priceEur: p.priceEur,
        priceGnf: p.priceGnf,
      };
      addItem(draft);
    }
    // clean URL
    router.replace("/box");
  }, [hydrated, initialAdd, products, addItem, router]);

  // Lidar animation selon l'étape
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- step → lid anim
    if (step === "preview") setLidAnim(0); // fermé
    else setLidAnim(1); // ouvert
  }, [step]);

  const tiles = useMemo(() => {
    const all = products.flatMap((p) => p.variants.map((v) => ({ product: p, variant: v })));
    if (category === "all") return all;
    return all.filter((t) => t.product.category === category);
  }, [products, category]);

  const totalXof = items.reduce((s, it) => s + it.priceXof, 0);
  const totalEur = items.reduce((s, it) => s + it.priceEur, 0);
  const totalGnf = items.reduce((s, it) => s + (it.priceGnf ?? 0), 0);
  const canCustomize = items.length >= 2;
  const isFull = items.length >= 5;

  function handleAddWithPending(product: Product, variant: ProductVariant) {
    if (isFull || !variant.inStock) return;
    const draft: DraftItem = {
      productId: product._id,
      variantId: variant._key,
      hex: variant.hex,
      category: product.category,
      title: product.title,
      colorName: variant.colorName,
      priceXof: product.priceXof,
      priceEur: product.priceEur,
      priceGnf: product.priceGnf,
    };
    // eslint-disable-next-line react-hooks/purity -- Date.now as key is intentional for animation
    setFlying({ hex: variant.hex, draft, key: Date.now() });
  }

  function handleFlyingDone() {
    const draft = flying?.draft;
    setFlying(null);
    if (draft) addItem(draft);
  }

  function handleAddBox() {
    if (!canCustomize || !cardDesignId) return;
    const boxId = crypto.randomUUID();
    addBox({
      kind: "box",
      boxId,
      items: items.map((it) => ({ productId: it.productId, variantId: it.variantId, qty: 1 })),
      giftMessage: giftMessage || undefined,
      cardDesignId,
    });
    track("add_to_box", {
      items: items.length,
      cardDesignId,
      hasGiftMessage: giftMessage ? true : false,
    });
    if (!reduced) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2800);
    } else {
      // reduced : toast statique sans animation chute
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2200);
    }
    clear();
    setStep("select");
  }

  // Reprise brouillon banner (7j géré dans store)
  const hasDraft = hydrated && items.length > 0;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-center text-sm text-ink/60" role="status" aria-live="polite">
          Chargement…
        </p>
      </div>
    );
  }

  const boxSceneItems = items.map((it) => ({ hex: it.hex, category: it.category }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
      {/* Header */}
      <header className="text-center">
        <h1 className="font-serif text-4xl tracking-tight md:text-5xl">Composez votre box</h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink/60">Choisissez 2 à 5 articles. La boîte, le papier de soie et la carte sont offerts.</p>
      </header>

      {/* Draft banner */}
      {hasDraft && step === "select" && (
        <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-center text-sm" role="status" aria-live="polite">
          Vous aviez commencé une box —{" "}
          <button
            type="button"
            onClick={() => setStep("select")}
            className="inline-flex min-h-[44px] items-center font-medium text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1"
          >
            Reprendre là où vous étiez
          </button>
          <button
            type="button"
            onClick={clear}
            className="ml-2 inline-flex min-h-[44px] items-center rounded-full px-3 text-xs text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Effacer le brouillon de box"
          >
            Effacer
          </button>
        </div>
      )}

      {/* Stepper — nav sémantique */}
      <nav aria-label="Étapes de composition de la box" className="mt-8 flex justify-center">
        <ol className="flex gap-2 text-xs" role="list">
          {[
            { id: "select", label: "1. Choisissez" },
            { id: "customize", label: "2. Personnalisez" },
            { id: "preview", label: "3. Prévisualisez" },
          ].map((s) => {
            const active = step === s.id;
            return (
              <li key={s.id}>
                <span
                  aria-current={active ? "step" : undefined}
                  className={`inline-flex min-h-[28px] items-center rounded-full px-3 py-1 ${active ? "bg-ink text-cream" : "bg-sand text-ink/60"}`}
                >
                  {s.label}
                  {active && <span className="sr-only"> — étape en cours</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile mini sticky header — garde la box visible en scroll */}
      <BoxMiniSticky items={boxSceneItems} lidOpen={lidAnim} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        {/* Scène 2.5D — décorative, jamais seule porteuse d'info (liste textuelle en dessous) */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div
            id="box-scene-anchor"
            className="rounded-2xl border border-sand bg-cream p-2"
            role="group"
            aria-label={`Visualisation de la box — ${items.length}/5 articles`}
          >
            <BoxScene lidOpen={lidAnim} items={boxSceneItems} />
            <p className="sr-only">
              Scène 3D décorative de la boîte VELMIRYS. Le contenu réel de votre box est listé ci-dessous en texte et reste accessible sans la 3D.
            </p>
          </div>
          {/* Liste items dans la boîte (texte) — source de vérité */}
          <section aria-labelledby="box-items-heading" className="mt-4 rounded-2xl border border-sand bg-cream p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="box-items-heading" className="text-sm font-medium">
                Vos articles ({items.length}/5)
              </h2>
              <span
                id="box-status"
                aria-live="polite"
                className={`text-xs ${canCustomize ? "text-green-700" : "text-ink/60"}`}
              >
                {items.length === 0
                  ? "Votre box est vide — ajoutez un premier article pour la voir se remplir."
                  : items.length < 2
                    ? `Encore ${2 - items.length} article(s) pour pouvoir personnaliser votre box.`
                    : isFull
                      ? "Votre box est pleine — 5 articles, c'est parfait."
                      : `${items.length} article(s) — vous pouvez personnaliser.`}
              </span>
            </div>
            {items.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2" aria-label="Articles dans la box">
                {items.map((it, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm">
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: it.hex }}
                      aria-hidden="true"
                    />
                    <span className="flex-1">
                      {it.title} — {it.colorName}
                    </span>
                    <span className="text-xs text-ink/60">
                      {formatPrice(currency === "GNF" ? it.priceGnf : currency === "EUR" ? it.priceEur : it.priceXof, currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="inline-flex min-h-[44px] items-center rounded-full px-3 text-xs text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`Retirer ${it.title} — ${it.colorName} de la box`}
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {items.length > 0 && (
              <p className="mt-3 text-right text-sm font-medium">
                Total : {formatPrice(currency === "GNF" ? totalGnf : currency === "EUR" ? totalEur : totalXof, currency)}{" "}
                <span className="text-xs font-normal text-ink/60">
                  {formatPrice(currency === "EUR" ? totalXof : totalEur, currency === "EUR" ? "XOF" : "EUR")}
                </span>
              </p>
            )}
            <p className="mt-1 text-right text-xs text-ink/60">Emballage cadeau offert</p>
          </section>
          {/* CTA desktop */}
          {step === "select" && (
            <button
              type="button"
              onClick={() => canCustomize && setStep("customize")}
              disabled={!canCustomize}
              aria-disabled={!canCustomize}
              aria-describedby="box-status"
              className={`mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-8 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${canCustomize ? "bg-ink text-cream hover:bg-accent" : "cursor-not-allowed bg-ink/15 text-ink/60"}`}
            >
              Personnaliser ma box
            </button>
          )}
        </div>

        {/* Panneau étapes */}
        <div className="flex flex-col gap-6">
          {step === "select" && (
            <>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer les articles par catégorie">
                {(["all", "foulard", "bonnet", "epingle"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    aria-label={`Filtrer : ${c === "all" ? "Tout" : c === "epingle" ? "Épingles" : c === "foulard" ? "Foulards" : "Bonnets"}${category === c ? " — actif" : ""}`}
                    className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-1.5 text-sm capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${category === c ? "border-ink bg-ink text-cream" : "border-ink/15 hover:border-ink/40"}`}
                  >
                    {c === "all" ? "Tout" : c === "epingle" ? "Épingles" : c === "foulard" ? "Foulards" : "Bonnets"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {tiles.map(({ product, variant }) => {
                  const disabled = !variant.inStock || isFull;
                  return (
                    <div key={`${product._id}-${variant._key}`} className="flex flex-col gap-2 rounded-2xl border border-sand bg-cream p-3">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand">
                        <div className="h-full w-full" style={{ backgroundColor: variant.hex }} aria-hidden="true" />
                        {!variant.inStock && (
                          <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs text-cream">Épuisé</span>
                        )}
                        <span className="absolute bottom-2 right-2 rounded-full bg-cream px-2 py-0.5 text-xs shadow" aria-hidden="true">
                          {variant.colorName}
                        </span>
                      </div>
                      <div className="px-1">
                        <p className="text-sm font-medium leading-tight">{product.title}</p>
                        <p className="text-xs text-ink/60">{variant.colorName}</p>
                        <p className="mt-1 text-sm font-medium">
                          {formatPrice(currency === "GNF" ? product.priceGnf : currency === "EUR" ? product.priceEur : product.priceXof, currency)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddWithPending(product, variant)}
                        disabled={disabled}
                        aria-label={
                          !variant.inStock
                            ? `${product.title} — ${variant.colorName} bientôt de retour`
                            : isFull
                              ? "Box pleine — retirez un article avant d'ajouter"
                              : `Ajouter ${product.title} — ${variant.colorName} à la box`
                        }
                        className={`mt-1 inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${disabled ? "cursor-not-allowed bg-ink/10 text-ink/60" : "bg-ink text-cream hover:bg-accent"}`}
                      >
                        {variant.inStock ? (isFull ? "Box pleine" : "+ Ajouter à la box") : "Bientôt de retour"}
                      </button>
                    </div>
                  );
                })}
              </div>
              {tiles.length === 0 && (
                <p className="py-8 text-center text-sm text-ink/60" role="status">
                  Aucun article dans cette catégorie.
                </p>
              )}
            </>
          )}

          {step === "customize" && (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-sand bg-cream p-6">
                <h2 className="font-serif text-xl">Votre message</h2>
                <label htmlFor="box-gift-message" className="mt-4 block text-sm font-medium">
                  Votre message cadeau (optionnel)
                </label>
                <textarea
                  id="box-gift-message"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Quelques mots pour elle…"
                  rows={4}
                  maxLength={250}
                  aria-describedby="gift-counter gift-hint gift-preview"
                  className="mt-2 w-full rounded-xl border border-ink/15 bg-white p-3 text-sm placeholder:text-ink/60 focus:border-ink focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <div className="mt-1 flex justify-between text-xs text-ink/60">
                  <span id="gift-hint">250 caractères maximum, imprimés sur la carte.</span>
                  <span id="gift-counter" aria-live="polite">
                    {giftMessage.length}/250
                  </span>
                </div>
                {giftMessage && (
                  <div id="gift-preview" className="mt-4 rounded-xl bg-sand p-3">
                    <p className="text-xs text-ink/60">Aperçu sur la carte</p>
                    <p className="mt-1 font-serif text-sm italic" aria-live="polite">
                      “{giftMessage}”
                    </p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Exemples de messages cadeaux">
                  {giftExamples.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setGiftMessage(ex)}
                      aria-label={`Utiliser le message : ${ex}`}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-ink/15 px-3 py-1 text-xs hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-sand bg-cream p-6">
                <h2 className="font-serif text-xl">Choisissez la carte</h2>
                <p className="mt-1 text-xs text-ink/60">Obligatoire — cette carte sera glissée dans votre box.</p>
                <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label="Choix de la carte cadeau">
                  {cards.map((card) => {
                    const active = cardDesignId === card._id;
                    const imgUrl = card.image ? urlFor(card.image as never).width(400).height(280).fit("crop").url() : null;
                    return (
                      <button
                        key={card._id}
                        type="button"
                        onClick={() => setCard(card._id)}
                        aria-pressed={active}
                        aria-label={`Choisir la carte ${card.name}${active ? " — sélectionnée" : ""}`}
                        className={`overflow-hidden rounded-2xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${active ? "border-ink" : "border-transparent hover:border-ink/20"}`}
                      >
                        {imgUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgUrl} alt={card.name} className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <div className="flex aspect-[4/3] w-full items-center justify-center bg-sand p-4 text-center">
                            <span className="font-serif text-sm">{card.name}</span>
                          </div>
                        )}
                        <p className="px-3 py-2 text-xs font-medium">{card.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-ink/15 py-3 text-sm hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Modifier le contenu
                </button>
                <button
                  type="button"
                  onClick={() => cardDesignId && setStep("preview")}
                  disabled={!cardDesignId}
                  aria-disabled={!cardDesignId}
                  className={`inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${cardDesignId ? "bg-ink text-cream hover:bg-accent" : "cursor-not-allowed bg-ink/15 text-ink/60"}`}
                >
                  Voir ma box
                </button>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-sand bg-cream p-6 text-center">
                <h2 className="font-serif text-2xl">Votre box est prête 🤍</h2>
                <p className="mt-2 text-sm text-ink/60">Aperçu final — la boîte se ferme, papier de soie scellé.</p>
              </div>

              <section aria-labelledby="preview-content-heading" className="rounded-2xl border border-sand bg-cream p-6">
                <h3 id="preview-content-heading" className="text-sm font-medium">
                  Contenu
                </h3>
                <ul className="mt-3 flex flex-col gap-2" aria-label="Contenu de la box">
                  {items.map((it, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: it.hex }} aria-hidden="true" />
                      {it.title} — {it.colorName}
                      <span className="ml-auto text-ink/60">
                        {formatPrice(currency === "GNF" ? it.priceGnf : currency === "EUR" ? it.priceEur : it.priceXof, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-sand pt-3 text-sm">
                  <span>Carte</span>
                  <span className="font-medium">{cards.find((c) => c._id === cardDesignId)?.name ?? cardDesignId}</span>
                </div>
                {giftMessage && (
                  <div className="mt-2 flex justify-between text-sm">
                    <span>Message</span>
                    <span className="max-w-[60%] text-right italic">“{giftMessage}”</span>
                  </div>
                )}
                <div className="mt-3 flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>{formatPrice(currency === "GNF" ? totalGnf : currency === "EUR" ? totalEur : totalXof, currency)}</span>
                </div>
                <p className="mt-1 text-right text-xs text-green-700">Emballage cadeau offert</p>
                <p className="text-right text-xs text-ink/60">
                  {formatPrice(currency === "EUR" ? totalXof : totalEur, currency === "EUR" ? "XOF" : "EUR")}
                </p>
              </section>

              <button
                type="button"
                onClick={handleAddBox}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-ink py-3.5 text-sm font-medium text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Ajouter la box au panier
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("customize")}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-ink/15 py-3 text-sm hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setStep("select");
                  }}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-ink/15 py-3 text-sm hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Composer une autre box
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {flying && <FlyingItem key={flying.key} hex={flying.hex} onDone={handleFlyingDone} />}

      {showConfetti && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div className={`rounded-2xl bg-ink px-6 py-4 text-center text-cream shadow-xl ${reduced ? "" : "animate-in fade-in zoom-in"}`}>
            <p className="font-serif text-lg">Box ajoutée au panier 🎉</p>
            <p className="mt-1 text-sm text-cream/80">Papier de soie — confettis !</p>
          </div>
          {/* confettis papier simples — désactivés si reduced */}
          {!reduced && (
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute h-2 w-3 rotate-12 bg-white/80"
                  style={{
                    left: `${8 + i * 5}%`,
                    top: `-10px`,
                    animation: `fall ${1.2 + (i % 3) * 0.4}s ease-in forwards`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          )}
          {!reduced && <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(540deg); opacity:0; } }`}</style>}
        </div>
      )}
      {/* Mobile CTA sticky */}
      {step === "select" && canCustomize && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-cream p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setStep("customize")}
            aria-label={`Personnaliser ma box — ${items.length} sur 5 articles`}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-ink py-3 text-sm font-medium text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Personnaliser ma box ({items.length}/5)
          </button>
        </div>
      )}
    </div>
  );
}
