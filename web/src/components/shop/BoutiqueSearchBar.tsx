"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function BoutiqueSearchBar({ placeholder, label }: { placeholder: string; label: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  function update(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/boutique?${qs}` : "/boutique", { scroll: false });
  }

  return (
    <div role="search" aria-label={label} className="relative w-full md:w-72">
      <input
        type="search"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => update(e.target.value)}
        className="h-11 w-full rounded-full border border-ink/15 bg-white px-4 pr-10 text-sm placeholder:text-ink/40 focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        spellCheck={false}
        autoComplete="off"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/30" aria-hidden="true">
        ⌕
      </span>
      {q && (
        <button
          type="button"
          onClick={() => update("")}
          aria-label="Effacer la recherche"
          className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full px-2 text-xs text-ink/60 hover:text-accent"
        >
          ✕
        </button>
      )}
    </div>
  );
}
