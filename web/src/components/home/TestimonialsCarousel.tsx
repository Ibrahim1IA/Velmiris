"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Item = { quote: string; author: string };

export default function TestimonialsCarousel({
  surtitle,
  items,
}: {
  surtitle: string;
  items: Item[];
}) {
  const validItems = items.filter((it) => it.quote?.trim() && it.author?.trim()).slice(0, 5);
  const count = validItems.length;
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  const shouldAutoPlay = !reduced && !paused && !isHovering && count > 1;

  const goTo = useCallback((i: number) => {
    setIndex(() => {
      const n = count;
      return ((i % n) + n) % n;
    });
  }, [count]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-play 5s
  useEffect(() => {
    if (!shouldAutoPlay) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setIndex((cur) => (cur + 1) % count);
    }, 5000);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldAutoPlay, count]);

  // Keyboard navigation when container focused
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(count - 1);
    }
  }, [next, prev, goTo, count]);

  // Single item : render without carousel logic
  if (count <= 1) {
    const sole = validItems[0];
    if (!sole) return null;
    return (
      <section className="bg-sand/40 border-y border-sand" aria-labelledby="testimonials-title">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24 text-center">
          <p id="testimonials-title" className="text-xs tracking-[0.28em] text-ink/50">
            {surtitle}
          </p>
          <div className="mx-auto mt-10 max-w-3xl">
            <p className="font-serif text-[22px] leading-relaxed md:text-[26px] md:leading-[1.6] text-ink/90 italic">
              &ldquo;{sole.quote}&rdquo;
            </p>
            <div className="mx-auto mt-6 h-px w-10 bg-ink/15" aria-hidden="true" />
            <p className="mt-6 text-xs tracking-[0.16em] font-medium text-ink/60">{sole.author}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-sand/40 border-y border-sand"
      aria-labelledby="testimonials-title"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div ref={containerRef} className="mx-auto max-w-6xl px-6 py-20 md:py-24 text-center" tabIndex={0} onKeyDown={onKeyDown} aria-label="Carrousel témoignages — flèches gauche/droite pour naviguer">
        <p id="testimonials-title" className="text-xs tracking-[0.28em] text-ink/50">
          {surtitle}
        </p>

        {/* Live region for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Témoignage {index + 1} sur {count} : {validItems[index]?.quote} — {validItems[index]?.author}
        </div>

        <div className="relative mx-auto mt-10 max-w-3xl">
          {/* Slides — opacity cross-fade, respects reduced motion */}
          <div className="relative min-h-[180px] md:min-h-[160px]">
            {validItems.map((item, i) => (
              <div
                key={`${item.author}-${i}`}
                id={`testimonial-panel-${i}`}
                role="tabpanel"
                aria-roledescription="slide"
                aria-label={`${i + 1} sur ${count}`}
                hidden={i !== index}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"} ${reduced ? "!transition-none" : ""}`}
              >
                <p className="font-serif text-[22px] leading-relaxed md:text-[26px] md:leading-[1.6] text-ink/90 italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mx-auto mt-6 h-px w-10 bg-ink/15" aria-hidden="true" />
                <p className="mt-6 text-xs tracking-[0.16em] font-medium text-ink/60">{item.author}</p>
              </div>
            ))}
          </div>

          {/* Prev/Next — visible on hover/focus, always keyboard accessible */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between md:flex">
            <button
              type="button"
              onClick={prev}
              aria-label="Témoignage précédent"
              className="pointer-events-auto -ml-2 md:-ml-8 inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/80 text-ink/60 shadow-sm backdrop-blur transition hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Témoignage suivant"
              className="pointer-events-auto -mr-2 md:-mr-8 inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/80 text-ink/60 shadow-sm backdrop-blur transition hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        {/* Dots — tab semantics, correct a11y */}
        <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Témoignages">
          {validItems.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls={`testimonial-panel-${i}`}
              aria-label={`Aller au témoignage ${i + 1} sur ${count}`}
              onClick={() => goTo(i)}
              className={`h-2 w-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sand ${i === index ? "bg-ink" : "bg-ink/15 hover:bg-ink/30"}`}
            />
          ))}
        </div>

        {/* Pause/play control — accessible, respects reduced motion */}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused || reduced}
          aria-label={paused || reduced ? "Reprendre le défilement automatique" : "Mettre en pause le défilement automatique"}
          className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] tracking-wide text-ink/40 hover:text-ink/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span aria-hidden="true" className="text-[10px]">{paused || reduced ? "▶" : "❚❚"}</span>
          {paused || reduced ? "Reprendre" : "Pause"}
        </button>
      </div>
    </section>
  );
}
