import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Stayora — Four brands. Twelve addresses.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    title: "Four brands. Twelve addresses.",
    subtitle: "Eco Inn, Inn, Plaza, and Resort across India. Request to book — no payment on this site.",
  });
}
