import { ImageResponse } from "next/og";
import { client } from "@/sanity/lib/client";

export const runtime = "edge";
export const alt = "Fiche produit VELMIRYS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type OgProduct = {
  title: string;
  priceXof: number;
  priceEur: number;
  description?: string;
  variants: Array<{
    colorName: string;
    hex: string;
    images?: Array<{ asset?: { _ref?: string; _id?: string } }>;
  }>;
};

function formatXof(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " FCFA";
}
function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
}

function humanizeSlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product: OgProduct | null = null;
  try {
    product = await client.fetch<OgProduct | null>(
      `*[_type == "product" && slug.current == $slug][0]{
        title, priceXof, priceEur, description,
        variants[]{ colorName, hex, images }
      }`,
      { slug },
      { next: { revalidate: 60, tags: ["products"] } },
    );
  } catch {
    product = null;
  }

  const title = product?.title ?? humanizeSlug(slug);
  const variant = product?.variants?.[0];
  const colorName = variant?.colorName ?? "";
  const hex = variant?.hex && /^#([0-9A-Fa-f]{3}){1,2}$/.test(variant.hex) ? variant.hex : "#F3EDE4";
  const priceXof = product?.priceXof;
  const priceEur = product?.priceEur;

  // Note: Sanity CDN image embed optional — color block is reliable for edge OG.
  // If image available we could render <img> but hex placeholder guarantees WhatsApp preview without external fetch failures.

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#FAF7F2",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Left — color block */}
        <div
          style={{
            width: "630px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: hex,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 13,
                letterSpacing: "0.32em",
                color: "rgba(28,25,23,0.55)",
                background: "rgba(250,247,242,0.92)",
                padding: "8px 16px",
                borderRadius: 999,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 600,
              }}
            >
              VELMIRYS
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "rgba(28,25,23,0.6)",
                background: "rgba(250,247,242,0.88)",
                padding: "6px 12px",
                borderRadius: 999,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {colorName || "Édition premium"}
            </div>
          </div>
        </div>

        {/* Right — details */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 48px 40px 48px",
            background: "#FAF7F2",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                fontSize: 14,
                letterSpacing: "0.32em",
                color: "#1C1917",
                fontWeight: 700,
              }}
            >
              VELMIRYS
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "rgba(28,25,23,0.45)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Boutique · {colorName || "Foulard premium"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "flex",
                fontSize: 46,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#1C1917",
                fontWeight: 700,
              }}
            >
              {title.length > 42 ? title.slice(0, 42) + "…" : title}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "rgba(28,25,23,0.65)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {colorName ? `${colorName} · jersey premium` : "Jersey premium · emballage offert"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
              {typeof priceXof === "number" ? (
                <div
                  style={{
                    display: "flex",
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#1C1917",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {formatXof(priceXof)}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontSize: 16,
                    color: "rgba(28,25,23,0.5)",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Prix sur WhatsApp
                </div>
              )}
              {typeof priceEur === "number" && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 16,
                    color: "rgba(28,25,23,0.5)",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {formatEur(priceEur)}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                background: "#1C1917",
                color: "#FAF7F2",
                borderRadius: 999,
                padding: "12px 20px",
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Voir le produit →
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 12,
                color: "rgba(28,25,23,0.45)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Emballage cadeau offert · velmirys.com/boutique/{slug}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
