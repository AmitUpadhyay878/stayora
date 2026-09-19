import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BRAND_OPTIONS } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About Stayora",
  description:
    "Stayora is a family of four hotel brands across India. Eco Inn, Inn, Plaza, and Resort share the same care: clean rooms, honest kitchens, and a real welcome.",
  path: "/about",
});

export default async function AboutPage() {
  const [hotels, cities] = await Promise.all([prisma.hotel.count(), prisma.city.count()]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">About Stayora</p>
      <h1 className="mt-3 text-4xl font-semibold">A warm welcome at every tier.</h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">
        Stayora is a family of four hotel brands across {cities} Indian destinations. Whether you are
        travelling for a temple darshan, a business week, a wedding, or a forest safari, there is a
        Stayora that fits the trip — and the same care in every one of our {hotels} properties.
      </p>
      <p className="mt-4 leading-8">
        We keep our rooms simple and well-kept, our kitchens honest, and our front desks staffed by
        people who know the neighbourhood. No loyalty gimmicks, no opaque pricing — just a good night
        and a real welcome.
      </p>

      <h2 className="mt-12 text-2xl font-semibold">Our four brands</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {BRAND_OPTIONS.map((brand) => (
          <div key={brand.id} className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{brand.tier}</p>
            <p className="mt-2 text-lg font-semibold">{brand.label}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {brand.id === "eco-inn" && "Economical stays without dropping comfort — clean rooms, reliable wifi, fair prices."}
              {brand.id === "inn" && "Quality and affordability for leisure and business, close to the places that matter."}
              {brand.id === "plaza" && "Refined design and top-tier amenities for celebrations and long stays."}
              {brand.id === "resort" && "Scenic retreats where the landscape does the talking."}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-muted p-8">
        <h2 className="text-xl font-semibold">Booking with Stayora</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Sign in, send a booking request for the property and dates you want, and our team confirms
          availability. There is no payment on this site — it is a request, not a lock, so overlapping
          requests are fine.
        </p>
        <Link href="/hotels" className={`${buttonVariants()} mt-6`}>
          Browse our hotels
        </Link>
      </div>
    </div>
  );
}
