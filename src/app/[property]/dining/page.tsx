import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Utensils } from "lucide-react";
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
      diningName: true,
      diningBlurb: true,
      brand: { select: { name: true } },
      city: { select: { name: true } },
    },
  });
  return hotelPageMeta(hotel, {
    suffix: hotel?.diningName ?? "Dining",
    pathSuffix: "/dining",
    description: hotel
      ? `${hotel.diningName} at ${hotel.name} in ${hotel.city.name}. ${hotel.diningBlurb}`
      : undefined,
  });
}

export default async function DiningPage({ params }: { params: Promise<{ property: string }> }) {
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
          { name: "Dining", path: `/${hotel.slug}/dining` },
        ])}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Dining</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{hotel.diningName}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{hotel.diningBlurb}</p>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
        <Image
          src={hotel.images[1] ?? hotel.images[0]}
          alt={`${hotel.diningName} at ${hotel.name}`}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <Utensils className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold">Cuisine</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Regional Indian cooking with a short continental menu for early departures.
          </p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <Clock className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold">Hours</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Breakfast 7:00–10:30, lunch 12:30–15:00, dinner 19:00–22:30.
          </p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Good to know</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Vegetarian, Jain, and satvik requests can be arranged — let us know when you book.
          </p>
        </div>
      </div>
    </div>
  );
}
