"use client";

import { useRouter } from "next/navigation";
import { PropertyCard } from "@/components/hotels/property-card";
import { useWishlist, useWishlistToggle, type PropertyCardDto } from "@/hooks/use-api";
import { authClient } from "@/lib/auth-client";

export function PropertyGrid({ hotels }: { hotels: PropertyCardDto[] }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const wishlist = useWishlist();
  const toggle = useWishlistToggle();
  const savedIds = new Set(wishlist.data?.items.map((item) => item.hotelId) ?? []);

  if (!hotels.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-lg font-semibold">No properties match these filters</p>
        <p className="mt-2 text-sm text-muted-foreground">Clear the filters to see all twelve Stayora properties.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {hotels.map((hotel) => (
        <PropertyCard
          key={hotel.id}
          hotel={hotel}
          saved={savedIds.has(hotel.id)}
          onToggle={(hotelId, saved) => {
            if (isPending) return;
            if (!session?.user) {
              router.push(`/sign-in?callbackUrl=${encodeURIComponent("/wishlist")}`);
              return;
            }
            toggle.mutate({ hotelId, saved });
          }}
        />
      ))}
    </div>
  );
}
