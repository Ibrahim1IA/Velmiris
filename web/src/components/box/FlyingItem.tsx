"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface Props {
  hex: string;
  onDone: () => void;
}

/**
 * Animation "vol" courbée 0.6s (PRD §5.3) depuis la tuile vers la boîte
 * Utilise un portail fixed + GSAP bezier
 */
export default function FlyingItem({ hex, onDone }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) {
      // prefers-reduced-motion : ajout instantané sans animation
      onDone();
      return;
    }
    const el = ref.current;
    if (!el) return;
    const box = document.getElementById("box-scene-anchor");
    const boxRect = box?.getBoundingClientRect();
    const targetX = boxRect ? boxRect.left + boxRect.width / 2 - window.innerWidth / 2 : 0;
    const targetY = boxRect ? boxRect.top + boxRect.height / 2 - window.innerHeight / 2 : -120;

    const tween = gsap.fromTo(
      el,
      { x: -180, y: 60, scale: 1, opacity: 1, rotation: -8 },
      {
        x: targetX,
        y: targetY,
        scale: 0.22,
        rotation: 12,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: onDone,
      }
    );
    return () => {
      tween.kill();
    };
  }, [onDone, reduced]);
  if (reduced) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-1/2 top-1/2 z-[70] h-16 w-12 rounded-xl border border-black/10 shadow-lg"
      style={{ backgroundColor: hex }}
    />
  );
}
