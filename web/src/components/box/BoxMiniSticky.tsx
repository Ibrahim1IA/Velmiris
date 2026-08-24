"use client";

import { useEffect, useState } from "react";
import BoxFallback2D from "./BoxFallback2D";

interface Props {
  items: { hex: string; category: "foulard" | "bonnet" | "epingle" }[];
  lidOpen: number;
}

export default function BoxMiniSticky({ items, lidOpen }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById("box-scene-anchor");
    if (!anchor) return;
    const io = new IntersectionObserver(
      ([e]) => setShow(!e.isIntersecting),
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" }
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, []);

  if (!show) return null;

  return (
    <div
      className="sticky top-[56px] z-20 -mx-6 flex items-center gap-3 border-y border-sand bg-cream/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-cream/90 lg:hidden"
      role="status"
      aria-live="polite"
      aria-label={`Box ${items.length} sur 5 articles`}
    >
      <div className="shrink-0">
        <BoxFallback2D lidOpen={lidOpen} items={items} compact />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-xs font-medium">
          {items.length === 0 ? "Box vide" : `${items.length}/5 articles`}
        </p>
        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full border ${i < items.length ? "border-black/10" : "border-ink/10 bg-ink/5"}`}
              style={i < items.length ? { backgroundColor: items[i].hex } : undefined}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => document.getElementById("box-scene-anchor")?.scrollIntoView({ behavior: "smooth", block: "center" })}
        className="inline-flex min-h-[36px] items-center rounded-full border border-ink/15 px-4 text-xs font-medium hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Voir
      </button>
    </div>
  );
}
