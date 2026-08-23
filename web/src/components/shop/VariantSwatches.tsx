import Link from "next/link";

type VariantLite = {
  _key: string;
  colorName: string;
  hex: string;
  inStock: boolean;
};

export default function VariantSwatches({
  variants,
  activeKey,
  basePath,
  label,
}: {
  variants: VariantLite[];
  activeKey: string;
  basePath: string;
  label: string;
}) {
  return (
    <div>
      <p id="variant-label" className="mb-3 text-sm font-medium">
        {label}
      </p>
      <div className="flex flex-wrap gap-3" role="group" aria-labelledby="variant-label">
        {variants.map((v) => {
          const isActive = v._key === activeKey;
          return (
            <Link
              key={v._key}
              href={`${basePath}?variant=${v._key}`}
              scroll={false}
              aria-label={`${v.colorName}${!v.inStock ? " — Épuisé" : isActive ? " — sélectionné" : ""}`}
              aria-current={isActive ? "true" : undefined}
              title={`${v.colorName}${!v.inStock ? " (Épuisé)" : isActive ? " (sélectionné)" : ""}`}
              className={`relative flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                isActive
                  ? "border-ink ring-2 ring-ink ring-offset-2"
                  : "border-transparent hover:border-ink/20"
              } ${!v.inStock ? "opacity-40" : ""}`}
            >
              <span
                className="h-8 w-8 rounded-full border border-black/10"
                style={{ backgroundColor: v.hex }}
                aria-hidden="true"
              />
              {!v.inStock && (
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="h-[2px] w-8 rotate-45 bg-ink/60" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-ink/60" aria-live="polite" aria-atomic="true">
        {variants.find((v) => v._key === activeKey)?.colorName}
      </p>
    </div>
  );
}
