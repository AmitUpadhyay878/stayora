import { prisma } from "@/lib/db";
import { ogImage } from "@/lib/og";

export async function hotelOgImage(slug: string, suffix?: string) {
  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: {
      name: true,
      images: true,
      brand: { select: { name: true } },
      city: { select: { name: true } },
    },
  });

  if (!hotel) {
    return ogImage({
      title: "Stayora",
      subtitle: "This property could not be found.",
    });
  }

  return ogImage({
    eyebrow: hotel.brand.name,
    title: suffix ?? hotel.name,
    subtitle: suffix ? `${hotel.name} · ${hotel.city.name}` : `${hotel.city.name} · ${hotel.brand.name}`,
    image: hotel.images[0],
  });
}

export async function hotelOgAlt(slug: string, suffix?: string) {
  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { name: true, city: { select: { name: true } } },
  });
  if (!hotel) return "Stayora";
  return suffix ? `${suffix} · ${hotel.name}` : `${hotel.name}, ${hotel.city.name}`;
}
