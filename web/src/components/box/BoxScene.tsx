"use client";

import BoxFallback2D from "./BoxFallback2D";

interface Item {
  hex: string;
  category: "foulard" | "bonnet" | "epingle";
}

interface Props {
  lidOpen: number; // 0-1
  items: Item[];
  float?: boolean;
  enableOrbit?: boolean;
  className?: string;
}

/**
 * Box View — /box uniquement en 2.5D (retour initial)
 * WebGL gardé en code mais non utilisé sur /box (fallback 2.5D forcé).
 * ProceduralBox conservé pour usage futur si besoin.
 */
export default function BoxScene({ lidOpen, items }: Props) {
  // Retour 2.5D initial : toujours le fallback CSS sur /box
  return <BoxFallback2D lidOpen={lidOpen} items={items} />;
}
