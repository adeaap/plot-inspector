import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Plot Inspector, EUDR deforestation check";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #052e16 0%, #064e3b 55%, #14532d 100%)",
        color: "#ecfdf5",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        padding: 80,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🌳</div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: -0.5,
            color: "#bbf7d0",
          }}
        >
          Plot Inspector
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          Has this plot lost forest since the EUDR cutoff?
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#bbf7d0",
            maxWidth: 920,
            lineHeight: 1.35,
          }}
        >
          Pick any latitude/longitude. Get a Hansen-data EUDR-style
          deforestation check in seconds.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#86efac",
        }}
      >
        <span>Next.js 16 · React 19 · tRPC · MapLibre</span>
        <span>Demo · open source</span>
      </div>
    </div>,
    size,
  );
}
