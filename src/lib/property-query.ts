import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { DirectoryParamsInput } from "@/lib/validators";

export async function resolveCitySlug(city: string | undefined): Promise<string | undefined> {
  if (!city) return undefined;
  const found = await prisma.city.findUnique({ where: { slug: city }, select: { slug: true } });
  return found ? city : undefined;
}

export function propertyWhere(params: DirectoryParamsInput): Prisma.HotelWhereInput {
  const where: Prisma.HotelWhereInput = {};

  if (params.brand) {
    where.brand = { slug: params.brand };
  }

  if (params.city) {
    where.city = { slug: params.city };
  }

  if (params.guests) {
    where.guests = { gte: params.guests };
  }

  return where;
}

export function propertyOrderBy(
  sort?: DirectoryParamsInput["sort"],
): Prisma.HotelOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ pricePerNight: "asc" }];
    case "price_desc":
      return [{ pricePerNight: "desc" }];
    case "rating_desc":
      return [{ rating: "desc" }, { reviewCount: "desc" }];
    default:
      return [{ featured: "desc" }, { rating: "desc" }];
  }
}

export const propertyCardSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  pricePerNight: true,
  guests: true,
  rating: true,
  reviewCount: true,
  amenities: true,
  images: true,
  featured: true,
  brand: {
    select: { name: true, slug: true, tier: true },
  },
  city: {
    select: { name: true, slug: true, country: true },
  },
} satisfies Prisma.HotelSelect;

export const propertyDetailInclude = {
  brand: true,
  city: true,
  roomCategories: { orderBy: { sortOrder: "asc" } },
  galleryImages: { orderBy: { sortOrder: "asc" } },
  nearbyAttractions: { orderBy: { sortOrder: "asc" } },
  reviews: { orderBy: { createdAt: "desc" } },
} satisfies Prisma.HotelInclude;

export type PropertyCard = Prisma.HotelGetPayload<{ select: typeof propertyCardSelect }>;
export type PropertyDetail = Prisma.HotelGetPayload<{ include: typeof propertyDetailInclude }>;
