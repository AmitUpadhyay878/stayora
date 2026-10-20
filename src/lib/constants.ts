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
  { id: "extra-bed", label: "Extra bed", price: 800, per: "night" },
  { id: "connecting-rooms", label: "Connecting rooms", price: 1200, per: "stay" },
  { id: "early-check-in", label: "Early check-in", price: 500, per: "stay" },
  { id: "late-check-out", label: "Late check-out", price: 700, per: "stay" },
  { id: "airport-transfer", label: "Airport transfer", price: 1500, per: "stay" },
  { id: "breakfast", label: "Breakfast included", price: 450, per: "night" },
] as const;

export type RoomExtraId = (typeof ROOM_EXTRAS)[number]["id"];
export type ExtraChargePer = (typeof ROOM_EXTRAS)[number]["per"];

export function extraById(id: string) {
  return ROOM_EXTRAS.find((extra) => extra.id === id);
}

export function extraLabel(id: string) {
  return extraById(id)?.label ?? id;
}

export function extraPrice(id: string) {
  return extraById(id)?.price ?? 0;
}
