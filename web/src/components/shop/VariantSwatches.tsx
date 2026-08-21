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
      <p className="mb-3 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-3">
        {variants.map((v) => {
          const isActive = v._key === activeKey;
          return (
            <Link
              key={v._key}
              href={`${basePath}?variant=${v._key}`}
              scroll={false}
              aria-label={`${v.colorName}${!v.inStock ? " — Épuisé" : ""}`}
              aria-current={isActive ? "true" : undefined}
              title={`${v.colorName}${!v.inStock ? " (Épuisé)" : ""}`}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                isActive
                  ? "border-ink ring-2 ring-ink ring-offset-2"
                  : "border-transparent hover:border-ink/20"
              } ${!v.inStock ? "opacity-40" : ""}`}
            >
              <span
                className="h-8 w-8 rounded-full border border-black/10"
                style={{ backgroundColor: v.hex }}
                aria-hidden
              />
              {!v.inStock && (
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden
                >
                  <span className="h-[2px] w-8 rotate-45 bg-ink/60" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-ink/60">
        {variants.find((v) => v._key === activeKey)?.colorName}
      </p>
    </div>
  );
}
