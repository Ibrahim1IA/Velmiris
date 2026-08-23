"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface Props {
  lidOpen: number; // 0 fermé → 1 ouvert (~105°)
  float?: boolean;
}

export default function ProceduralBox({ lidOpen, float = true }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const lidGroupRef = useRef<THREE.Group>(null);
  const reduced = usePrefersReducedMotion();
  const { pointer } = useThree();

  // Logo texture Canvas — évite le .glb Logo_Plane
  const logoTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#1C1917";
    ctx.font = "600 52px Fraunces, Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "0.18em";
    ctx.fillText("VELMIRYS", c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((state) => {
    // Float + mouse parallax (desktop)
    if (reduced) {
      if (groupRef.current) {
        groupRef.current.position.y = 0;
        groupRef.current.rotation.y = 0;
      }
      if (lidGroupRef.current) {
        lidGroupRef.current.rotation.x = -lidOpen * 1.82;
      }
      return;
    }
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      if (float) {
        groupRef.current.position.y = Math.sin(t * 0.7) * 0.008;
        // mouse parallax — lerp doux vers pointer.x
        const targetY = pointer.x * 0.08 + Math.sin(t * 0.25) * 0.05;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.04);
      } else {
        groupRef.current.position.y = 0;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.06);
      }
    }
    if (lidGroupRef.current) {
      const target = -lidOpen * 1.82; // 105°
      // lerp plus rapide que avant (0.14) pour répondre au scrub
      lidGroupRef.current.rotation.x = THREE.MathUtils.lerp(lidGroupRef.current.rotation.x, target, 0.14);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base — contraste vs fond cream #FAF7F2 : kraft chaud */}
      <mesh position={[0, 0.02, 0]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[0.52, 0.1, 0.32]} />
        <meshPhysicalMaterial
          color="#EDE3D3"
          roughness={0.82}
          metalness={0}
          clearcoat={0.14}
          clearcoatRoughness={0.88}
          sheen={0.18}
          sheenColor="#FFF8EE"
        />
      </mesh>
      {/* Fond intérieur plus sombre pour profondeur */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.5, 0.098, 0.3]} />
        <meshStandardMaterial color="#E8DDD0" roughness={0.9} side={THREE.BackSide} />
      </mesh>

      {/* Charnière — groupe pivot à l'arête arrière supérieure de la base */}
      <group ref={lidGroupRef} position={[0, 0.07, -0.16]}>
        {/* Couvercle — légèrement plus clair que la base pour lire la charnière */}
        <mesh position={[0, 0.01, 0.16]} castShadow={false} receiveShadow={false}>
          <boxGeometry args={[0.54, 0.02, 0.34]} />
          <meshPhysicalMaterial
            color="#FFFEFB"
            roughness={0.84}
            metalness={0}
            clearcoat={0.16}
            clearcoatRoughness={0.82}
          />
        </mesh>
        {/* Logo sur couvercle — plan avec texture canvas */}
        {logoTexture && (
          <mesh position={[0, 0.021, 0.16]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.28, 0.07]} />
            <meshBasicMaterial map={logoTexture} transparent opacity={0.95} side={THREE.DoubleSide} />
          </mesh>
        )}
        {/* Rebord intérieur couvercle pour épaisseur */}
        <mesh position={[0, 0.005, 0.16]}>
          <boxGeometry args={[0.52, 0.008, 0.32]} />
          <meshStandardMaterial color="#F3EDE4" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
