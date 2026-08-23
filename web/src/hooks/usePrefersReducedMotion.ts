"use client";

import { useEffect, useState } from "react";

/**
 * Respecte prefers-reduced-motion (PRD §7.4 / §8.2)
 * Retourne true si l'utilisateur préfère moins d'animations.
 * SSR-safe : false par défaut, hydraté côté client.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(m.matches);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration from matchMedia
    setReduced(m.matches);
    // Safari <14 fallback
    if (m.addEventListener) m.addEventListener("change", handler);
    else m.addListener(handler);
    return () => {
      if (m.removeEventListener) m.removeEventListener("change", handler);
      else m.removeListener(handler);
    };
  }, []);

  return reduced;
}
