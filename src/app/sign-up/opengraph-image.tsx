import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Create a Stayora account";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    eyebrow: "Stayora",
    title: "Create your Stayora account.",
    subtitle: "Save a wishlist and request stays across twelve hotels.",
  });
}
