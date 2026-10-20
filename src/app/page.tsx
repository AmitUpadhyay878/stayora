import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/property-query";
import { PropertyGrid } from "@/components/hotels/property-grid";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { BRAND_OPTIONS } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const [featured, quotes, stats] = await Promise.all([
    prisma.hotel.findMany({
      where: { featured: true },
      take: 6,
      orderBy: { rating: "desc" },
      select: propertyCardSelect,
    }),
    prisma.review.findMany({
      take: 3,
      orderBy: { rating: "desc" },
      include: { hotel: { select: { name: true, city: { select: { name: true } } } } },
    }),
    Promise.all([prisma.hotel.count(), prisma.city.count()]).then(([hotels, cities]) => ({ hotels, cities })),
  ]);

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }]),
          faqJsonLd([
            {
              question: "Does Stayora take payment online?",
              answer:
                "Guests can book without an account and pay a 20% deposit online to reserve. The remaining 80% is settled at the hotel when you check out. Members pay the same 20% deposit.",
            },
            {
              question: "How many Stayora hotels are there?",
              answer: "Twelve properties across four brands — Eco Inn, Inn, Plaza, and Resort — in eleven Indian destinations.",
            },
            {
              question: "Can I filter hotels by guests?",
              answer: "Yes. On Our hotels, filter by brand, city, and party size. Five-plus guests matches any property that can sleep five or more.",
            },
          ]),
        ]}
      />
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80"
            alt="Stayora hotel courtyard at golden hour"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/25" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">The Stayora Group</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Four brands. Twelve addresses. One warm welcome.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            From economical city stays to forest retreats, Stayora runs hotels across India with the same care at every tier.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/hotels" className={buttonVariants({ size: "lg" })}>
              Explore our hotels
            </Link>
            <Link
              href="/hotels"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold sm:text-3xl">Our four brands</h2>
            <p className="mt-2 text-muted-foreground">Every tier, the same attention to a good night&apos;s sleep.</p>
          </div>
        </Reveal>
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BRAND_OPTIONS.map((brand) => (
            <Link
              key={brand.id}
              href={`/hotels?brand=${brand.id}`}
              className="group rounded-2xl border border-border bg-card p-6 shadow-[0_8px_24px_rgba(31,31,31,0.05)] transition-transform duration-200 hover:-translate-y-1"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{brand.tier}</p>
              <p className="mt-3 text-lg font-semibold group-hover:underline">{brand.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {brand.id === "eco-inn" && "Economical stays without dropping comfort."}
                {brand.id === "inn" && "Quality and affordability for leisure and business."}
                {brand.id === "plaza" && "Refined design and top-tier amenities."}
                {brand.id === "resort" && "Scenic retreats worth the detour."}
              </p>
            </Link>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Featured properties</h2>
              <p className="mt-2 text-muted-foreground">Guest favourites across the group.</p>
            </div>
            <Link href="/hotels" className={buttonVariants({ variant: "outline" })}>
              View all
            </Link>
          </div>
        </Reveal>
        <PropertyGrid hotels={featured} />
      </section>

      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The group at a glance</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">A growing family of hotels</h2>
            </div>
          </Reveal>
          <Reveal className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { label: "Brands", value: "4", detail: "Eco Inn, Inn, Plaza, and Resort" },
              { label: "Hotels", value: String(stats.hotels), detail: "City branches across India" },
              { label: "Destinations", value: String(stats.cities), detail: "From Ambaji to the Sahyadris" },
            ].map((stat) => (
              <article
                key={stat.label}
                className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/8 px-8 py-10 text-center"
              >
                <p className="text-4xl font-semibold tracking-tight sm:text-5xl">{stat.value}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{stat.label}</p>
                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-background/65">{stat.detail}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-semibold sm:text-3xl">Guests keep coming back</h2>
        </Reveal>
        <Reveal className="mt-8 grid gap-6 md:grid-cols-3">
          {quotes.map((quote) => (
            <blockquote key={quote.id} className="rounded-2xl bg-card p-6 shadow-sm">
              <p className="flex items-center gap-1 text-sm font-medium">
                <Star className="h-4 w-4 fill-foreground" /> {quote.rating}.0
              </p>
              <p className="mt-3 text-sm leading-6">&ldquo;{quote.body}&rdquo;</p>
              <footer className="mt-4 text-sm text-muted-foreground">
                {quote.author} · {quote.hotel.name}, {quote.hotel.city.name}
              </footer>
            </blockquote>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-foreground px-8 py-14 text-background sm:px-14">
          <h2 className="text-3xl font-semibold sm:text-4xl">Ready for your next stay?</h2>
          <p className="mt-3 max-w-xl text-background/75">
            Browse the full collection and send a booking request in minutes.
          </p>
          <Link href="/hotels" className={`${buttonVariants({ size: "lg" })} mt-6`}>
            Explore our hotels
          </Link>
        </div>
      </section>
    </div>
  );
}
