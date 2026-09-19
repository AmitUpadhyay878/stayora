import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "About Stayora";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    eyebrow: "About Stayora",
    title: "A warm welcome at every tier.",
    subtitle: "Four hotel brands across India. The same care in every room.",
  });
}
