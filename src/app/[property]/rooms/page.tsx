import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { propertyDetailInclude } from "@/lib/property-query";
import { extraLabel } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, hotelPageMeta } from "@/lib/seo";

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
  return hotelPageMeta(hotel, {
    suffix: "Rooms",
    pathSuffix: "/rooms",
    description: hotel
      ? `Room types at ${hotel.name} in ${hotel.city.name}. Compare size, occupancy, views, and stay options, then request to book.`
      : undefined,
  });
}

export default async function RoomsPage({ params }: { params: Promise<{ property: string }> }) {
  const { property } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug: property },
    include: propertyDetailInclude,
  });
  if (!hotel) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: hotel.name, path: `/${hotel.slug}` },
          { name: "Rooms", path: `/${hotel.slug}/rooms` },
        ])}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Rooms</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{hotel.name} rooms</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every room category at this property. Tell us your preference in the booking request and we
        will match you to the best available room.
      </p>

      <div className="mt-10 space-y-8">
        {hotel.roomCategories.map((room) => (
          <article
            key={room.id}
            className="grid gap-6 overflow-hidden rounded-2xl bg-card p-0 shadow-sm sm:grid-cols-2"
          >
            <div className="relative min-h-60">
              <Image src={room.image} alt={room.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:pr-8">
              <h2 className="text-xl font-semibold">{room.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{room.summary}</p>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-muted px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Size</dt>
                  <dd className="font-medium">{room.sizeSqFt} sq ft</dd>
                </div>
                <div className="rounded-xl bg-muted px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Sleeps</dt>
                  <dd className="font-medium">{room.sleeps}</dd>
                </div>
                <div className="rounded-xl bg-muted px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Bed</dt>
                  <dd className="font-medium">{room.bedType}</dd>
                </div>
              </dl>
              {room.view ? <p className="mt-3 text-sm text-muted-foreground">View: {room.view}</p> : null}
              {room.priceFrom ? (
                <p className="mt-1 text-sm font-medium">From {formatCurrency(room.priceFrom)} / night</p>
              ) : null}
              {(room.extras ?? []).length ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {(room.extras ?? []).map((extra) => (
                    <li key={extra} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {extraLabel(extra)}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={`/book/${hotel.slug}?room=${room.slug}`}
                className={`${buttonVariants({ size: "sm" })} mt-5 w-fit`}
              >
                Request this room
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-foreground px-8 py-10 text-background">
        <h2 className="text-2xl font-semibold">Ready to stay at {hotel.name}?</h2>
        <p className="mt-2 max-w-xl text-background/75">
          From {formatCurrency(hotel.pricePerNight)} per night.
        </p>
        <Link href={`/book/${hotel.slug}`} className={`${buttonVariants({ size: "lg" })} mt-5`}>
          Book Now
        </Link>
      </div>
    </div>
  );
}
