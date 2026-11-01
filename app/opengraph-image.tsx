import { ImageResponse } from "next/og";
import { LeafMark } from "@/lib/leaf-mark";

// The picture WhatsApp, X, Slack and friends show when someone shares a link.
export const alt = "Tankas: Snap. Clean. Earn.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#0e1a13",
          color: "#f7f9f8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <LeafMark size={128} radius={30} />
          <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -3 }}>Tankas</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 56, color: "#38e07b" }}>Snap. Clean. Earn.</div>
        <div style={{ marginTop: 16, fontSize: 34, color: "#a9b8af" }}>
          Ghana&apos;s environmental cleanup coordination platform.
        </div>
      </div>
    ),
    size,
  );
}
