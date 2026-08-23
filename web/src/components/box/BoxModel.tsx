"use client";
/* eslint-disable react-hooks/immutability -- Three.js object mutation in render loop is intentional */

import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Draco decoder pour box.glb optimisé (5 Ko draco) — public/draco/
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (useGLTF as any).setDecoderPath?.("/draco/");
}

interface Props {
  lidOpen: number; // 0 fermé → 1 ouvert (~105°)
  float?: boolean;
}

useGLTF.preload("/models/box.glb");

export default function BoxModel({ lidOpen, float = true }: Props) {
  const { scene } = useGLTF("/models/box.glb") as unknown as { scene: THREE.Group };
  const groupRef = useRef<THREE.Group>(null);
  const reduced = usePrefersReducedMotion();

  // Clone mémoïsé pour éviter mutation + recréation à chaque frame
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const mesh = o as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });
    return c;
  }, [scene]);

  const lidObject = useMemo(() => cloned.getObjectByName("Box_Lid") || null, [cloned]);

  useFrame((state) => {
    if (reduced) {
      // prefers-reduced-motion : pas de flottement, ouverture instantanée
      if (groupRef.current) {
        groupRef.current.position.y = 0;
        groupRef.current.rotation.y = 0;
      }
      if (lidObject) {
        const target = -lidOpen * 1.83;
        lidObject.rotation.x = target;
      }
      return;
    }
    if (groupRef.current && float) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.008;
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.05;
    } else if (groupRef.current) {
      groupRef.current.position.y = 0;
      groupRef.current.rotation.y = 0;
    }
    if (lidObject) {
      // Pivot déjà à la charnière (blender location). Rotation X : 0 fermé → -~1.83 rad (105°)
      const target = -lidOpen * 1.83;
      // lerp doux
      lidObject.rotation.x = THREE.MathUtils.lerp(lidObject.rotation.x, target, 0.12);
    }
  });

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      <primitive object={cloned} />
    </group>
  );
}
