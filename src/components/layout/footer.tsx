import Link from "next/link";
import { prisma } from "@/lib/db";

export async function Footer() {
  const properties = await prisma.hotel.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-lg font-semibold">Stayora</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A family of four hotel brands across eleven Indian destinations. Eco Inn, Inn, Plaza, and Resort.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Our brands</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {[
              { href: "/hotels?brand=eco-inn", label: "Stayora Eco Inn" },
              { href: "/hotels?brand=inn", label: "Stayora Inn" },
              { href: "/hotels?brand=plaza", label: "Stayora Plaza" },
              { href: "/hotels?brand=resort", label: "Stayora Resort" },
            ].map((brand) => (
              <li key={brand.href}>
                <Link href={brand.href} className="hover:text-foreground">
                  {brand.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Our properties</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {properties.slice(0, 6).map((property) => (
              <li key={property.slug}>
                <Link href={`/${property.slug}`} className="hover:text-foreground">
                  {property.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Guests</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/hotels" className="hover:text-foreground">
                All properties
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-foreground">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/bookings" className="hover:text-foreground">
                Your requests
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-foreground">
                Account
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-foreground">
                About Stayora
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
