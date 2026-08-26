"use client";

import { useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface Item {
  hex: string;
  category: "foulard" | "bonnet" | "epingle";
}

interface Props {
  lidOpen: number; // 0 fermé → 1 ouvert
  items: Item[];
  compact?: boolean;
}

/**
 * Fallback 2.5D — illustration GSAP sans WebGL
 * Fonctionnalité identique, wow réduit mais élégant (PRD §7.4)
 */
export default function BoxFallback2D({ lidOpen, items, compact = false }: Props) {
  const lidRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const itemCount = items.length;

  // animation simple du couvercle via CSS transform — désactivée si reduced
  const lidStyle: React.CSSProperties = {
    transform: `perspective(600px) rotateX(${-lidOpen * 105}deg)`,
    transformOrigin: "top center",
    transition: reduced ? "none" : "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
  };

  if (compact) {
    return (
      <div
        className="flex items-center justify-center"
        role="img"
        aria-label={`Box VELMIRYS mini — ${itemCount}/5 articles`}
      >
        <div className="relative flex flex-col items-center">
          <div style={lidStyle} className="h-2 w-14 rounded-t-md border border-ink/10 bg-cream shadow-sm">
            <span className="flex h-full items-center justify-center font-serif text-[6px] tracking-[0.15em] text-ink/60">VELMIRYS</span>
          </div>
          <div className="relative -mt-0.5 flex h-7 w-14 flex-wrap items-center justify-center gap-0.5 rounded-b-md border border-ink/10 bg-sand">
            {items.slice(0, 5).map((it, i) => (
              <span key={i} className="h-2 w-2 rounded-full border border-black/10" style={{ backgroundColor: it.hex }} aria-hidden="true" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center py-8"
      role="img"
      aria-label={`Box VELMIRYS illustration 2D — ${itemCount}/5 articles, couvercle ${lidOpen > 0.5 ? "ouvert" : "fermé"}. Décoratif, voir la liste textuelle.`}
    >
      {/* Couvercle */}
      <div
        ref={lidRef}
        style={lidStyle}
        className="h-6 w-48 rounded-t-xl border border-ink/10 bg-cream shadow-sm"
      >
        <div className="flex h-full items-center justify-center">
          <span className="font-serif text-[10px] tracking-[0.2em] text-ink/60">VELMIRYS</span>
        </div>
      </div>
      {/* Corps */}
      <div className="relative -mt-1 flex h-32 w-48 flex-col items-center justify-center rounded-b-2xl border border-ink/10 bg-sand shadow-md">
        {/* papier de soie simulé */}
        <div
          className={`absolute inset-2 rounded-xl bg-white/70 ${reduced ? "" : "transition-all duration-500"}`}
          style={{ transform: `scale(${0.9 + itemCount * 0.02})`, opacity: itemCount ? 1 : 0.6 }}
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap justify-center gap-1.5 p-4" aria-hidden="true">
          {items.map((it, i) => (
            <span
              key={i}
              className={`h-6 w-6 rounded-full border border-black/10 shadow-sm ${reduced ? "" : "animate-in fade-in zoom-in duration-300"}`}
              style={{ backgroundColor: it.hex }}
              aria-hidden="true"
              title={it.category}
            />
          ))}
          {itemCount === 0 && <span className="text-xs text-ink/60">Votre box est vide</span>}
        </div>
        <p className="absolute bottom-1.5 text-[10px] text-ink/60" aria-hidden="true">
          {itemCount}/5 articles
        </p>
      </div>
    </div>
  );
}
