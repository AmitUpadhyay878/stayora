import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
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
    suffix: "Gallery",
    pathSuffix: "/gallery",
    description: hotel
      ? `Photos of ${hotel.name} in ${hotel.city.name} — rooms, dining, and the neighbourhood around this ${hotel.brand.name}.`
      : undefined,
  });
}

export default async function GalleryPage({ params }: { params: Promise<{ property: string }> }) {
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
          { name: "Gallery", path: `/${hotel.slug}/gallery` },
        ])}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Gallery</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{hotel.name} in pictures</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The property, the rooms, and the setting around {hotel.city.name}.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hotel.galleryImages.map((image, index) => (
          <figure
            key={image.id}
            className={`relative overflow-hidden rounded-2xl ${index === 0 ? "sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-auto sm:min-h-96" : "aspect-[4/3]"}`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
