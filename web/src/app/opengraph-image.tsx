import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VELMIRYS — Le voile, porté comme un présent.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF7F2",
          padding: "56px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.35em",
              color: "#1C1917",
              fontWeight: 700,
            }}
          >
            VELMIRYS
          </div>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(28,25,23,0.45)",
            }}
          >
            velmirys.com
          </div>
        </div>

        {/* Center */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#1C1917",
              fontWeight: 700,
              maxWidth: 860,
            }}
          >
            Le voile, porté comme un présent.
          </div>
          <div
            style={{
              fontSize: 20,
              lineHeight: 1.5,
              color: "rgba(28,25,23,0.65)",
              maxWidth: 640,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Foulards en jersey premium, bonnets et épingles à hijab. Composez votre box cadeau
            personnalisée — emballage signature offert.
          </div>
        </div>

        {/* Footer pill */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              background: "#1C1917",
              color: "#FAF7F2",
              borderRadius: 999,
              padding: "12px 24px",
              fontSize: 14,
              letterSpacing: "0.08em",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
            }}
          >
            Découvrir la boutique →
          </div>
          <div style={{ fontSize: 13, color: "rgba(28,25,23,0.45)", fontFamily: "system-ui, sans-serif" }}>
            Emballage soigné offert · Confirmation sur WhatsApp
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
