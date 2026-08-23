"use client";

import { useEffect, useState } from "react";

export type Tier = "high" | "low";

function detectTier(): Tier {
  if (typeof window === "undefined") return "high";
  // prefers-reduced-motion → low
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
  // saveData
  const conn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (conn?.saveData) return "low";
  if (conn?.effectiveType && ["slow-2g", "2g"].includes(conn.effectiveType)) return "low";
  // deviceMemory
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (mem !== undefined && mem <= 3) return "low";
  // hardwareConcurrency
  const cores = navigator.hardwareConcurrency;
  if (cores !== undefined && cores <= 4) return "low";
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
