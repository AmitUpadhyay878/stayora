import { ogContentType, ogSize } from "@/lib/og";
import { hotelOgImage } from "@/lib/hotel-og";

export const alt = "Dining at Stayora";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ property: string }> }) {
  const { property } = await params;
  return hotelOgImage(property, "Dining");
}
