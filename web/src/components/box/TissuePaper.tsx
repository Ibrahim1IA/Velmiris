"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface Props {
  count: number; // nombre d'items dans la box 0-5
}

/**
 * Papier de soie — 2 plans animés très légers (pas de shader complexe pour perf)
 * Se resserre à chaque ajout (PRD §5.3)
 */
export default function TissuePaper({ count }: Props) {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const reduced = usePrefersReducedMotion();

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (ref1.current) {
      ref1.current.rotation.z = Math.sin(t * 0.6) * 0.04;
      ref1.current.position.y = 0.02 + Math.sin(t * 0.8) * 0.005;
    }
    if (ref2.current) {
      ref2.current.rotation.z = Math.cos(t * 0.5) * 0.05;
      ref2.current.position.y = 0.025 + Math.cos(t * 0.7) * 0.004;
    }
  });

  const scale = 0.85 + count * 0.04; // se resserre légèrement
  return (
    <group>
      <mesh ref={ref1} position={[0, 0.02, 0]} scale={[scale, 1, scale]} rotation={[0, 0.2, 0]}>
        <planeGeometry args={[0.26, 0.16, 4, 4]} />
        <meshStandardMaterial color="#fdfbf8" transparent opacity={0.85} side={THREE.DoubleSide} roughness={0.95} />
      </mesh>
      <mesh ref={ref2} position={[0, 0.025, 0.01]} scale={[scale * 0.95, 1, scale * 0.95]} rotation={[0.05, -0.15, 0]}>
        <planeGeometry args={[0.24, 0.14, 4, 4]} />
        <meshStandardMaterial color="#fffaf5" transparent opacity={0.78} side={THREE.DoubleSide} roughness={0.95} />
      </mesh>
    </group>
  );
}
