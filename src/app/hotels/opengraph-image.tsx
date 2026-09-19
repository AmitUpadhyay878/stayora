import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Stayora hotels in India";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    eyebrow: "Our hotels",
    title: "Twelve properties, four brands.",
    subtitle: "Filter by brand, city, or guests, then request to book.",
  });
}
