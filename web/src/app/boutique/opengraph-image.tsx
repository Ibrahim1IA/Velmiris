import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Boutique VELMIRYS — Foulards premium, bonnets et épingles";
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
          background: "#FAF7F2",
          padding: "56px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 22, letterSpacing: "0.35em", color: "#1C1917", fontWeight: 700 }}>
              VELMIRYS
            </div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(28,25,23,0.45)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Boutique
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(28,25,23,0.45)", fontFamily: "system-ui, sans-serif" }}>
              Foulards · Bonnets · Épingles
            </div>
            <div
              style={{
                fontSize: 58,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#1C1917",
                fontWeight: 700,
              }}
            >
              Boutique
            </div>
            <div
              style={{
                fontSize: 19,
                lineHeight: 1.5,
                color: "rgba(28,25,23,0.65)",
                maxWidth: 560,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Chaque teinte a sa tuile — cliquez pour voir le modèle complet. 15–40 références premium.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#E8C4C4",
                border: "1px solid rgba(28,25,23,0.1)",
              }}
            />
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#3E4C63",
              }}
            />
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#9B7E8C",
              }}
            />
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#F3EDE4",
                border: "1px solid rgba(28,25,23,0.1)",
              }}
            />
            <div style={{ fontSize: 13, color: "rgba(28,25,23,0.5)", marginLeft: 8, fontFamily: "system-ui, sans-serif" }}>
              6 teintes · jersey premium qui ne glisse pas
            </div>
          </div>
        </div>

        {/* Right swatch column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
          <div
            style={{
              width: 220,
              height: 300,
              borderRadius: 24,
              background: "#E8C4C4",
              border: "1px solid rgba(28,25,23,0.08)",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(28,25,23,0.4)",
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            velmirys.com/boutique
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
