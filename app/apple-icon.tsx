import { ImageResponse } from "next/og";
import { LeafMark } from "@/lib/leaf-mark";

// Home-screen icon on iPhones. iOS rounds the corners itself, so the tile is square.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<LeafMark size={180} radius={0} />, size);
}
