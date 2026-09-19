import { ogContentType, ogSize } from "@/lib/og";
import { hotelOgImage } from "@/lib/hotel-og";

export const alt = "Request to book Stayora";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return hotelOgImage(slug, "Request to book");
}
