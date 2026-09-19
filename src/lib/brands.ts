export const RESERVED_SLUGS = [
  "about",
  "hotels",
  "sign-in",
  "sign-up",
  "wishlist",
  "bookings",
  "book",
  "account",
  "api",
] as const;

export type ReservedSlug = (typeof RESERVED_SLUGS)[number];

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}

export const BRAND_TIER_LABEL = {
  value: "Value",
  mid: "Mid-range",
  premium: "Premium",
  leisure: "Leisure",
} as const;

export const BRAND_BLURB = {
  "eco-inn": "Economical stays without dropping comfort.",
  inn: "Quality and affordability for leisure and business.",
  plaza: "Refined design and top-tier amenities.",
  resort: "Scenic retreats worth the detour.",
} as const;
