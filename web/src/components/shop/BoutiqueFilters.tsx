"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CATEGORIES = [
  { value: undefined, label: "all" },
  { value: "foulard", label: "foulard" },
  { value: "bonnet", label: "bonnet" },
  { value: "epingle", label: "epingle" },
] as const;

export default function BoutiqueFilters({
  labels,
}: {
  labels: Record<string, string>;
}) {
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? undefined;

  function hrefFor(cat: string | undefined) {
    if (!cat) return "/boutique";
    return `/boutique?category=${cat}`;
  }

  return (
    <div
      role="group"
      aria-label={labels.label}
      className="flex flex-wrap gap-2"
    >
      {CATEGORIES.map((c) => {
        const isActive = active === c.value;
        return (
          <Link
            key={c.label}
            href={hrefFor(c.value)}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              isActive
                ? "border-ink bg-ink text-cream"
                : "border-ink/15 bg-cream text-ink hover:border-accent hover:text-accent"
            }`}
          >
            {labels[c.label]}
          </Link>
        );
      })}
    </div>
  );
}
