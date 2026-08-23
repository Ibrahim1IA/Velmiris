"use client";

import * as THREE from "three";

interface Item {
  hex: string;
  category: "foulard" | "bonnet" | "epingle";
}

interface Props {
  items: Item[];
}

/**
 * Articles stylisés dans la boîte (PRD §5.3)
 * Foulard = plan texturé couleur + plis légers (plane scale)
 * Bonnet = forme simplifiée capsule (cylinder + sphere)
 * Épingles = mini boîte (box)
 * Pas de modélisation réaliste, perf ≤150Ko
 */
export default function BoxItems({ items }: Props) {
  return (
    <group position={[0, 0.015, 0]}>
      {items.map((it, i) => {
        const offset = (i - (items.length - 1) / 2) * 0.05;
        const y = 0.01 + (i % 2) * 0.015;
        const commonMat = (
          <meshStandardMaterial color={it.hex} roughness={0.7} metalness={0.05} />
        );
        if (it.category === "bonnet") {
          return (
            <group key={i} position={[offset, y, 0]} rotation={[0.2, 0.1, 0]}>
              <mesh>
                <cylinderGeometry args={[0.032, 0.035, 0.03, 12]} />
                {commonMat}
              </mesh>
              <mesh position={[0, 0.018, 0]}>
                <sphereGeometry args={[0.033, 12, 8]} />
                {commonMat}
              </mesh>
            </group>
          );
        }
        if (it.category === "epingle") {
          return (
            <mesh key={i} position={[offset, y, 0]} rotation={[0.1, 0.3, 0]}>
              <boxGeometry args={[0.05, 0.012, 0.03]} />
              <meshStandardMaterial color={it.hex} roughness={0.4} metalness={0.3} />
              {/* intérieur */}
              <mesh position={[0, 0.004, 0]}>
                <boxGeometry args={[0.045, 0.002, 0.025]} />
                {commonMat}
              </mesh>
            </mesh>
          );
        }
        // foulard
        return (
          <mesh key={i} position={[offset, y, (i % 2) * 0.005]} rotation={[0.15, 0.15 + i * 0.1, 0.08]}>
            <planeGeometry args={[0.09, 0.06]} />
            {commonMat}
            {/* pli simple via double plan décalé */}
            <mesh position={[0, 0, 0.001]} rotation={[0, 0, 0.15]}>
              <planeGeometry args={[0.085, 0.012]} />
              <meshStandardMaterial color={new THREE.Color(it.hex).multiplyScalar(0.9)} roughness={0.75} side={THREE.DoubleSide} transparent opacity={0.85} />
            </mesh>
          </mesh>
        );
      })}
    </group>
  );
}
