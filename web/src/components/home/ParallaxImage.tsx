"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  aspect?: string; // e.g. "aspect-[4/5]"
};

/**
 * Parallax léger GSAP — PRD §7.5
 * yPercent -6 → 6 scrub, désactivé si prefers-reduced-motion.
 * Parent aspect fixe évite CLS.
 */
export default function ParallaxImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
  containerClassName,
  aspect = "aspect-[4/5]",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    if (!container) return;
    const img = container.querySelector("img");
    if (!img) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );
    }, container);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl bg-sand shadow-sm ${aspect} ${containerClassName ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={`object-cover will-change-transform ${reduced ? "" : "scale-[1.08]"} ${className ?? ""}`}
      />
    </div>
  );
}
