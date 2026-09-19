"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data as T;
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => jsonFetch<{ brands: BrandDto[] }>("/api/brands"),
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: () => jsonFetch<{ cities: CityDto[] }>("/api/cities"),
  });
}

export function useHotels(params: Record<string, string | undefined> = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return useQuery({
    queryKey: ["hotels", qs],
    queryFn: () =>
      jsonFetch<{ hotels: PropertyCardDto[]; count: number }>(`/api/hotels${qs ? `?${qs}` : ""}`),
  });
}

export function useWishlist() {
  const { data: session, isPending } = authClient.useSession();
  return useQuery({
    queryKey: ["wishlist", session?.user.id],
    enabled: Boolean(session?.user.id) && !isPending,
    queryFn: () => jsonFetch<{ items: WishlistDto[] }>("/api/wishlist"),
  });
}

export function useBookings() {
  const { data: session, isPending } = authClient.useSession();
  return useQuery({
    queryKey: ["bookings", session?.user.id],
    enabled: Boolean(session?.user.id) && !isPending,
    queryFn: () => jsonFetch<{ bookings: BookingDto[] }>("/api/bookings"),
  });
}

export function useWishlistToggle() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  return useMutation({
    mutationFn: async ({ hotelId, saved }: { hotelId: string; saved: boolean }) => {
      if (!session?.user) throw new Error("Sign in to save properties");
      if (saved) {
        return jsonFetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hotelId }),
        });
      }
      return jsonFetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId }),
      });
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", session?.user.id] });
      toast.success(vars.saved ? "Removed from wishlist" : "Saved to wishlist");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export type BrandDto = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  tier: "value" | "mid" | "premium" | "leisure";
  _count?: { hotels: number };
};

export type CityDto = {
  id: string;
  name: string;
  slug: string;
  country: string;
  tagline: string;
  heroImage: string;
  _count?: { hotels: number };
};

export type PropertyCardDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricePerNight: number;
  guests: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  featured: boolean;
  brand: { name: string; slug: string; tier: BrandDto["tier"] };
  city: { name: string; slug: string; country: string };
};

export type WishlistDto = {
  id: string;
  hotelId: string;
  hotel: PropertyCardDto;
};

export type BookingDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  adults: number;
  children: number;
  roomPreference?: string | null;
  extras?: string[];
  status: string;
  createdAt: string;
  hotel: PropertyCardDto;
};
