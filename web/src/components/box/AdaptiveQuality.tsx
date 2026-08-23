"use client";

import { useEffect, useState } from "react";

export type Tier = "high" | "low";

function detectTier(): Tier {
  if (typeof window === "undefined") return "high";
  // Forcé via ?force3d=1
  try {
    if (typeof window !== "undefined" && window.location.search.includes("force3d=1")) return "high";
  } catch {}
  // saveData / 2G restent low (vrai besoin éco)
  const conn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (conn?.saveData) return "low";
  if (conn?.effectiveType && ["slow-2g", "2g"].includes(conn.effectiveType)) return "low";
  // Seuils assouplis : only very low-end → low (avant: mem<=3 / cores<=4 bannissait 80% Android)
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (mem !== undefined && mem <= 2) return "low";
  const cores = navigator.hardwareConcurrency;
  if (cores !== undefined && cores <= 2) return "low";
  // prefers-reduced-motion ne force plus low ici (géré dans BoxScene pour garder 3D statique)
  return "high";
}

export function useAdaptiveQuality(): Tier {
  const [tier, setTier] = useState<Tier>("high");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration from device signals
    setTier(detectTier());
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setTier(detectTier());
    m.addEventListener?.("change", handler);
    return () => m.removeEventListener?.("change", handler);
  }, []);
  return tier;
}

export function dprForTier(tier: Tier): [number, number] {
  return tier === "low" ? [1, 1.2] : [1, 2];
}
