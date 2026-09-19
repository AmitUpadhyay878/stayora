export const AMENITIES = [
  { id: "wifi", label: "Wifi" },
  { id: "pool", label: "Pool" },
  { id: "kitchen", label: "Kitchen" },
  { id: "parking", label: "Free parking" },
  { id: "air_conditioning", label: "Air conditioning" },
  { id: "workspace", label: "Dedicated workspace" },
  { id: "gym", label: "Gym" },
  { id: "breakfast", label: "Breakfast" },
  { id: "pet_friendly", label: "Pet friendly" },
  { id: "ocean_view", label: "Ocean view" },
] as const;

export const BRAND_OPTIONS = [
  { id: "eco-inn", label: "Stayora Eco Inn", tier: "Value" },
  { id: "inn", label: "Stayora Inn", tier: "Mid" },
  { id: "plaza", label: "Stayora Plaza", tier: "Premium" },
  { id: "resort", label: "Stayora Resort", tier: "Leisure" },
] as const;

export const PROPERTY_SORTS = [
  { id: "recommended", label: "Recommended" },
  { id: "price_asc", label: "Price: low to high" },
  { id: "price_desc", label: "Price: high to low" },
  { id: "rating_desc", label: "Top rated" },
] as const;

export const ROOM_EXTRAS = [
  { id: "extra-bed", label: "Extra bed" },
  { id: "connecting-rooms", label: "Connecting rooms" },
  { id: "early-check-in", label: "Early check-in" },
  { id: "late-check-out", label: "Late check-out" },
  { id: "airport-transfer", label: "Airport transfer" },
  { id: "breakfast", label: "Breakfast included" },
] as const;

export function extraLabel(id: string) {
  return ROOM_EXTRAS.find((extra) => extra.id === id)?.label ?? id;
}
