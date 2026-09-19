import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { propertyDetailInclude } from "@/lib/property-query";
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
    suffix: "Nearby attractions",
    pathSuffix: "/nearby-attractions",
    description: hotel
      ? `Places to visit near ${hotel.name} in ${hotel.city.name}. Distances and local notes from the Stayora team.`
      : undefined,
  });
}

export default async function NearbyAttractionsPage({
  params,
}: {
  params: Promise<{ property: string }>;
}) {
  const { property } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug: property },
    include: propertyDetailInclude,
  });
  if (!hotel) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: hotel.name, path: `/${hotel.slug}` },
          { name: "Nearby attractions", path: `/${hotel.slug}/nearby-attractions` },
        ])}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Nearby</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Around {hotel.name}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The places our team sends guests to first, all within easy reach of {hotel.city.name}.
      </p>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
        <Image src={hotel.images[0]} alt={hotel.city.name} fill className="object-cover" sizes="100vw" />
      </div>

      <ul className="mt-10 space-y-4">
        {hotel.nearbyAttractions.map((spot) => (
          <li key={spot.id} className="rounded-2xl bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="inline-flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" /> {spot.name}
              </p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {spot.distance}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{spot.blurb}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
