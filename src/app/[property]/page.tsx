import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star, Utensils, BedDouble, Trees } from "lucide-react";
import { prisma } from "@/lib/db";
import { propertyDetailInclude } from "@/lib/property-query";
import { formatCurrency } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/hotels/wishlist-button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, hotelJsonLd, hotelPageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ property: string }> }): Promise<Metadata> {
  const { property } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug: property },
    select: {
      name: true,
      slug: true,
      description: true,
      images: true,
      brand: { select: { name: true } },
      city: { select: { name: true } },
    },
  });
  return hotelPageMeta(hotel);
}

export default async function PropertyPage({ params }: { params: Promise<{ property: string }> }) {
  const { property } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug: property },
    include: propertyDetailInclude,
  });
  if (!hotel) notFound();

  const rooms = hotel.roomCategories;
  const nearby = hotel.nearbyAttractions.slice(0, 3);

  return (
    <div>
      <JsonLd
        data={[
          hotelJsonLd(hotel),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Our hotels", path: "/hotels" },
            { name: hotel.name, path: `/${hotel.slug}` },
          ]),
        ]}
      />
      <section className="relative isolate h-[42vh] min-h-72 overflow-hidden">
        <Image
          src={hotel.images[0]}
          alt={hotel.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 pb-10 sm:px-6 lg:px-8">
          <div>
            <Badge className="bg-white/90 text-foreground">{hotel.brand.name}</Badge>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">{hotel.name}</h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/85">
              <MapPin className="h-4 w-4" /> {hotel.city.name}, {hotel.city.country}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WishlistButton hotelId={hotel.id} name={hotel.name} showLabel />
            <Link href={`/book/${hotel.slug}`} className={buttonVariants({ size: "lg" })}>
              Book Now
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1 font-medium">
                <Star className="h-4 w-4 fill-foreground" /> {hotel.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">{hotel.reviewCount} reviews</span>
              <span className="text-muted-foreground">{hotel.brand.tagline}</span>
            </div>
            <p className="mt-6 text-lg leading-8 text-foreground/90">{hotel.description}</p>
            <p className="mt-4 text-sm text-muted-foreground">{hotel.address}</p>
          </div>
          <aside className="h-fit rounded-2xl bg-card p-6 shadow-[0_12px_32px_rgba(31,31,31,0.08)]">
            <p className="text-2xl font-semibold">
              {formatCurrency(hotel.pricePerNight)}
              <span className="text-sm font-normal text-muted-foreground"> / night</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Request to book. Our team confirms availability. No payment on this site.
            </p>
            <Link href={`/book/${hotel.slug}`} className={`${buttonVariants({ size: "lg" })} mt-5 w-full`}>
              Book Now
            </Link>
          </aside>
        </div>
      </section>

      {rooms.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="inline-flex items-center gap-2 text-2xl font-semibold">
                <BedDouble className="h-6 w-6 text-primary" /> Rooms
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Every room category at this property.</p>
            </div>
            <Link href={`/${hotel.slug}/rooms`} className="text-sm font-medium text-primary hover:underline">
              View all rooms
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <article key={room.id} className="overflow-hidden rounded-2xl bg-card shadow-sm">
                <div className="relative aspect-[4/3]">
                  <Image src={room.image} alt={room.name} fill className="object-cover" sizes="33vw" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{room.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{room.summary}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {room.sizeSqFt} sq ft · sleeps {room.sleeps} · {room.bedType}
                    {(room.extras ?? []).length ? ` · ${room.extras.length} options` : ""}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-2xl bg-card p-7 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
            <Utensils className="h-5 w-5 text-primary" /> Dining
          </h2>
          <p className="mt-2 text-lg font-medium">{hotel.diningName}</p>
          <p className="mt-1 text-sm text-muted-foreground">{hotel.diningBlurb}</p>
          <Link href={`/${hotel.slug}/dining`} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            More about dining
          </Link>
        </div>
        <div className="rounded-2xl bg-card p-7 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
            <Trees className="h-5 w-5 text-primary" /> Nearby
          </h2>
          <ul className="mt-3 space-y-3">
            {nearby.map((spot) => (
              <li key={spot.id} className="text-sm">
                <span className="font-medium">{spot.name}</span>
                <span className="text-muted-foreground"> · {spot.distance}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/${hotel.slug}/nearby-attractions`}
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            All nearby attractions
          </Link>
        </div>
      </section>
    </div>
  );
}
