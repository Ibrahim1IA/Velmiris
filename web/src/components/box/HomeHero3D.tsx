"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const BoxScene = dynamic(() => import("./BoxScene"), { ssr: false });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hero Unboxing — PRD §7.3
 * Timeline pilotée au scroll (GSAP ScrollTrigger + R3F) :
 * 0% fermée → 25% ouverture couvercle → 50% papier de soie → 75% envol teintes → 100% rangement palette
 * Ici : focus sur ouverture couvercle + flottement + halt à 75%, le reste est stylisé (tissus orbitants simulés via BoxItems si besoin)
 */
export default function HomeHero3D() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [lidOpen, setLidOpen] = useState(0);
  const lidRef = useRef({ v: 0 });

  // Tap-to-open sur mobile (secours si ScrollTrigger peu perceptible)
  const [tapOpen, setTapOpen] = useState(false);

  useEffect(() => {
    if (reduced) {
      // prefers-reduced-motion : boîte ouverte fixe, pas de ScrollTrigger
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync reduced motion to lid state
      setLidOpen(1);
      return;
    }
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lidRef.current,
        { v: 0 },
        {
          v: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
            onUpdate: (self) => {
              // 0-30% : ouverture couvercle, ensuite hold ouvert (phases suivantes visuelles)
              const p = self.progress;
              setLidOpen(p < 0.3 ? p / 0.3 : 1);
            },
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  // Items stylisés qui s'envolent autour (6 teintes §7.3)
  const orbitItems = [
    { hex: "#E8C4C4", category: "foulard" as const },
    { hex: "#3E4C63", category: "foulard" as const },
    { hex: "#9B7E8C", category: "foulard" as const },
    { hex: "#F3EDE4", category: "bonnet" as const },
    { hex: "#5C3A2E", category: "bonnet" as const },
    { hex: "#4A1F24", category: "epingle" as const },
  ];

  // En reduced-motion on fige la position, sinon n'afficher que si ouvert
  const showOrbit = reduced ? true : lidOpen > 0.3;

  const effectiveLid = reduced ? 1 : tapOpen ? 1 : lidOpen;

  return (
    <div
      ref={sectionRef}
      className="relative"
      role="img"
      aria-label="Box VELMIRYS ouverte en 3D — animation décorative d'unboxing. Faites défiler pour ouvrir la boîte, ou touchez la boîte sur mobile. Texte alternatif : la boîte s'ouvre, papier de soie scellé, tissus aux teintes douces. Contenu disponible aussi en navigation textuelle."
    >
      {/* Scene sticky — socle contrasté pour que la boîte crème ressorte */}
      <div className="sticky top-0 flex h-[68vh] items-center justify-center -mb-8 md:h-[72vh]">
        <div className="relative w-full max-w-xl">
          {/* Socle / stage — évite le ton-sur-ton cream #FAF7F2 */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] border border-ink/[0.06] shadow-[0_12px_40px_rgba(28,25,23,0.08)]"
            style={{
              background:
                "radial-gradient(ellipse 90% 70% at 50% 38%, #FFFFFF 0%, #F3EDE4 48%, #EDE6D6 78%, #E8DDD0 100%)",
            }}
            aria-hidden="true"
          />
          {/* Halo chaud au-dessus du socle */}
          <div
            className="pointer-events-none absolute left-1/2 top-[46%] h-44 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-500"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255,240,220,0.7) 0%, rgba(255,235,210,0.3) 35%, transparent 70%)",
              opacity: reduced ? 0.55 : effectiveLid * 0.75,
            }}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => !reduced && setTapOpen((v) => !v)}
            aria-label={effectiveLid > 0.5 ? "Fermer la boîte 3D" : "Ouvrir la boîte 3D"}
            className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[32px]"
          >
            <BoxScene
              lidOpen={effectiveLid}
              items={[]}
              float={!reduced}
              enableOrbit={false}
              className="h-[420px] w-full md:h-[520px]"
            />
          </button>
        </div>
      </div>

      {/* Scrollytelling spacer pour timeline Unboxing — caché si reduced */}
      <div className={`pointer-events-none ${reduced ? "h-[10vh]" : "h-[90vh]"}`} aria-hidden="true" />

      {/* Tissus orbitants (simulés en DOM 2D — phase 3 du scrollytelling) */}
      {showOrbit && (
        <div
          className="pointer-events-none absolute inset-x-0 top-[18vh] flex justify-center gap-3 opacity-70 md:gap-4"
          aria-hidden="true"
        >
          {orbitItems.map((it, i) => (
            <div
              key={i}
              className="h-10 w-14 rounded-lg border border-black/10 shadow-sm md:h-12 md:w-16"
              style={{
                backgroundColor: it.hex,
                transform: reduced
                  ? `rotate(${i * 2 - 6}deg)`
                  : `translateY(${Math.sin(i * 1.3) * 6}px) rotate(${i * 2 - 6}deg)`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}
      <p className="sr-only">
        Scène 3D décorative : boîte VELMIRYS. Cette animation n&apos;est pas porteuse d&apos;information essentielle — naviguez vers la boutique ou la section Box Builder pour le contenu textuel.
      </p>
    </div>
  );
}
