"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import ProceduralBox from "./ProceduralBox";
import TissuePaper from "./TissuePaper";
import BoxItems from "./BoxItems";
import { useAdaptiveQuality, dprForTier } from "./AdaptiveQuality";
import BoxFallback2D from "./BoxFallback2D";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

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
 * Scène mutualisée accueil / builder — Niveau 2 Three.js procédural (PRD §5.3, §7.3)
 * - ProceduralBox PBR (pas de .glb), hinge parfait, CanvasTexture logo
 * - DPR plafonné, mouse parallax léger, Environment studio
 * - Fallback 2.5D uniquement si tier low
 */
export default function BoxScene({ lidOpen, items, float = true, enableOrbit = false, className }: Props) {
  const tier = useAdaptiveQuality();
  const reduced = usePrefersReducedMotion();
  const dpr = dprForTier(tier);
  const effectiveFloat = reduced ? false : float;

  // Fallback 2.5D uniquement si tier low. prefers-reduced-motion garde la 3D statique (sans float/orbit)
  if (tier === "low") {
    return <BoxFallback2D lidOpen={lidOpen} itemCount={items.length} />;
  }

  const ariaLabel =
    items.length === 0
      ? "Box VELMIRYS ouverte, vide — illustration 3D décorative. Votre sélection apparaît aussi en liste textuelle ci-dessous."
      : `Box VELMIRYS ouverte contenant ${items.length} article(s), emballage cadeau offert — illustration 3D décorative. Voir la liste textuelle complète ci-dessous.`;

  return (
    <div
      className={className ?? "h-[360px] w-full md:h-[420px]"}
      role="img"
      aria-label={ariaLabel}
    >
      <Canvas
        dpr={dpr}
        camera={{ position: [0.45, 0.5, 0.55], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.15;
        }}
        style={{ background: "transparent" }}
        aria-hidden="true"
      >
        {/* Lumière studio + HDRI (validé) — Environment studio léger */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[1, 1.5, 1]} intensity={1.1} />
        <directionalLight position={[-0.8, 0.9, -0.6]} intensity={0.35} />
        <hemisphereLight args={["#fffaf5", "#1C1917", 0.3]} />

        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.6} />
          <group position={[0, -0.05, 0]}>
            <ProceduralBox lidOpen={lidOpen} float={effectiveFloat} />
            <TissuePaper count={items.length} />
            <BoxItems items={items} />
          </group>
          <ContactShadows position={[0, -0.02, 0]} opacity={0.24} scale={0.95} blur={1.6} far={0.7} color="#1C1917" />
        </Suspense>

        {enableOrbit && !reduced && (
          <OrbitControls enablePan={false} minDistance={0.35} maxDistance={1.2} minPolarAngle={0.2} maxPolarAngle={1.25} target={[0, 0.02, 0]} />
        )}
      </Canvas>
      <p className="sr-only">
        {ariaLabel} Cette scène 3D est décorative et ne porte pas seule l&apos;information — la liste textuelle des articles est toujours affichée en dessous.
      </p>
    </div>
  );
}
