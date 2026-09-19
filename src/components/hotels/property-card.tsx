"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { PropertyCardDto } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";

export function PropertyCard({
  hotel,
  saved,
  onToggle,
}: {
  hotel: PropertyCardDto;
  saved?: boolean;
  onToggle?: (hotelId: string, saved: boolean) => void;
}) {
  const image = hotel.images[0];

  return (
    <article className="group overflow-hidden rounded-2xl bg-card shadow-[0_8px_24px_rgba(31,31,31,0.06)] transition-transform duration-200 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/${hotel.slug}`} className="absolute inset-0 block">
          <Image
            src={image}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        {onToggle ? (
          <button
            type="button"
            aria-label={saved ? `Remove ${hotel.name} from wishlist` : `Save ${hotel.name}`}
            onClick={() => onToggle(hotel.id, Boolean(saved))}
            className="absolute right-3 top-3 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm"
          >
            <Heart className={`h-5 w-5 ${saved ? "fill-primary text-primary" : ""}`} />
          </button>
        ) : null}
        <Badge className="absolute left-3 top-3 bg-white/90 text-foreground">{hotel.brand.name.replace("Stayora ", "")}</Badge>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {hotel.city.name}
            </p>
            <h3 className="mt-1 text-base font-semibold leading-snug">
              <Link href={`/${hotel.slug}`} className="hover:underline">
                {hotel.name}
              </Link>
            </h3>
          </div>
          <p className="inline-flex items-center gap-1 text-sm font-medium">
            <Star className="h-4 w-4 fill-foreground text-foreground" />
            {hotel.rating.toFixed(1)}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{hotel.description}</p>
        <p className="text-sm">
          <span className="text-base font-semibold">{formatCurrency(hotel.pricePerNight)}</span>
          <span className="text-muted-foreground"> / night · {hotel.reviewCount} reviews</span>
        </p>
      </div>
    </article>
  );
}
