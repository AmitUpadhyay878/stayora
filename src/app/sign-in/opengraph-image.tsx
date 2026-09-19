import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Sign in to Stayora";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    eyebrow: "Stayora",
    title: "Welcome back.",
    subtitle: "Sign in to save hotels and send booking requests.",
  });
}
