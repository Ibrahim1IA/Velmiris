export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
      <div className="h-4 w-28 animate-pulse rounded bg-sand" />
      <div className="mt-6 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
        {/* Galerie skeleton */}
        <div className="flex flex-col gap-3">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-sand" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-sand/60" />
            ))}
          </div>
        </div>
        {/* Infos skeleton */}
        <div className="flex flex-col">
          <div className="h-3 w-40 animate-pulse rounded bg-sand" />
          <div className="mt-2 h-8 w-64 animate-pulse rounded bg-sand" />
          <div className="mt-4 h-6 w-32 animate-pulse rounded bg-sand" />
          <div className="mt-8 flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-10 animate-pulse rounded-full bg-sand" />
            ))}
          </div>
          <div className="mt-10 h-12 w-full animate-pulse rounded-full bg-sand" />
          <div className="mt-4 h-12 w-full animate-pulse rounded-full bg-sand/60" />
        </div>
      </div>
    </div>
  );
}
