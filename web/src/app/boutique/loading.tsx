export default function BoutiqueLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* Titre skeleton */}
      <header className="mb-8">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-sand" />
        <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-sand/60" />
      </header>

      {/* Filtres + count */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-sand" />
          ))}
        </div>
        <div className="h-4 w-20 animate-pulse rounded bg-sand/40" />
      </div>

      {/* Grille tuiles skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-sand" />
            <div className="px-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-sand" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-sand/60" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-sand/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
