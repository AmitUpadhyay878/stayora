import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { propertyDetailInclude } from "@/lib/property-query";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
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
      contactBlurb: true,
      brand: { select: { name: true } },
      city: { select: { name: true } },
    },
  });
  return hotelPageMeta(hotel, {
    suffix: "Contact",
    pathSuffix: "/contact-us",
    description: hotel
      ? `Contact ${hotel.name} in ${hotel.city.name}. ${hotel.contactBlurb}`
      : undefined,
  });
}

export default async function ContactPage({ params }: { params: Promise<{ property: string }> }) {
  const { property } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug: property },
    include: propertyDetailInclude,
  });
  if (!hotel) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: hotel.name, path: `/${hotel.slug}` },
          { name: "Contact", path: `/${hotel.slug}/contact-us` },
        ])}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Reach {hotel.name}</h1>
      <p className="mt-3 text-muted-foreground">{hotel.contactBlurb}</p>

      <div className="mt-8 space-y-4">
        <div className="flex items-start gap-4 rounded-2xl bg-card p-6 shadow-sm">
          <MapPin className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Address</p>
            <p className="mt-1 text-sm text-muted-foreground">{hotel.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl bg-card p-6 shadow-sm">
          <Phone className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Phone</p>
            <a href={`tel:${hotel.phone.replace(/\s/g, "")}`} className="mt-1 block text-sm text-muted-foreground hover:text-foreground">
              {hotel.phone}
            </a>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl bg-card p-6 shadow-sm">
          <Mail className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Email</p>
            <a href={`mailto:${hotel.email}`} className="mt-1 block text-sm text-muted-foreground hover:text-foreground">
              {hotel.email}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-foreground px-8 py-10 text-background">
        <h2 className="text-2xl font-semibold">Prefer to just book?</h2>
        <p className="mt-2 max-w-xl text-background/75">Send a request with your dates and we will confirm availability.</p>
        <Link href={`/book/${hotel.slug}`} className={`${buttonVariants({ size: "lg" })} mt-5`}>
          Book Now
        </Link>
      </div>
    </div>
  );
}
