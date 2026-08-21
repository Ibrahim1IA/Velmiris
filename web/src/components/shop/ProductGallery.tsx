import { urlFor } from "@/sanity/lib/image";

type GalleryImage = { asset?: unknown; hotspot?: unknown; crop?: unknown };

export default function ProductGallery({
  images,
  hex,
  title,
  colorName,
}: {
  images?: GalleryImage[];
  hex: string;
  title: string;
  colorName: string;
}) {
  const hasImages = images && images.length > 0;

  if (!hasImages) {
    return (
      <div
        className="aspect-[4/5] w-full rounded-2xl"
        style={{ backgroundColor: hex }}
        aria-label={`${title} — ${colorName} (aperçu couleur)`}
        role="img"
      />
    );
  }

  const main = images[0];
  const mainUrl = urlFor(main as never)
    .width(900)
    .height(1125)
    .fit("crop")
    .auto("format")
    .url();

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainUrl}
          alt={`${title} — ${colorName}`}
          width={900}
          height={1125}
          className="h-auto w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(1, 5).map((img, i) => {
            const thumbUrl = urlFor(img as never)
              .width(200)
              .height(250)
              .fit("crop")
              .auto("format")
              .url();
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={thumbUrl}
                alt=""
                width={200}
                height={250}
                loading="lazy"
                className="aspect-[4/5] rounded-xl object-cover"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
