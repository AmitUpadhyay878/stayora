import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { propertyCardSelect, propertyOrderBy, propertyWhere } from "@/lib/property-query";
import { directoryParamsSchema } from "@/lib/validators";
import { PropertyFilters } from "@/components/hotels/property-filters";
import { PropertyGrid } from "@/components/hotels/property-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Our hotels in India",
  description:
    "Browse twelve Stayora properties across Eco Inn, Inn, Plaza, and Resort. Filter by brand, city, or guests, then request to book — no payment collected.",
  path: "/hotels",
});

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const flat: Record<string, string> = {};
  Object.entries(raw).forEach(([key, value]) => {
    if (typeof value === "string") flat[key] = value;
    else if (Array.isArray(value) && value[0]) flat[key] = value[0];
  });
  const parsedResult = directoryParamsSchema.safeParse(flat);
  const parsed = parsedResult.success
    ? parsedResult.data
    : directoryParamsSchema.parse({});

  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });
  const city = cities.some((option) => option.slug === parsed.city) ? parsed.city : undefined;
  const hotels = await prisma.hotel.findMany({
    where: propertyWhere({ ...parsed, city }),
    orderBy: propertyOrderBy(parsed.sort),
    select: propertyCardSelect,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Our hotels", path: "/hotels" }])} />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Our hotels</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Twelve properties, four brands.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Filter by brand, destination, or party size to find the right Stayora.
      </p>

      <div className="mt-10">
        <Suspense fallback={null}>
          <PropertyFilters cities={cities} />
        </Suspense>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        {hotels.length} {hotels.length === 1 ? "property" : "properties"}
      </p>
      <div className="mt-4">
        <PropertyGrid hotels={hotels} />
      </div>
    </div>
  );
}
