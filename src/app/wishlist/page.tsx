"use client";

import Link from "next/link";
import { useWishlist } from "@/hooks/use-api";
import { PropertyGrid } from "@/components/hotels/property-grid";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();
  const properties = data?.items.map((item) => item.hotel) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Wishlist</h1>
      <p className="mt-2 text-muted-foreground">Properties you saved to your account.</p>
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : properties.length ? (
          <PropertyGrid hotels={properties} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-lg font-semibold">Nothing saved yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any property to keep it here.</p>
            <Link href="/hotels" className={`${buttonVariants()} mt-6`}>
              Browse our hotels
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
