"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Heart, Menu, Sparkles, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useHotels, type PropertyCardDto } from "@/hooks/use-api";

const links = [{ href: "/about", label: "About" }];

function groupByCity(hotels: PropertyCardDto[]) {
  const map = new Map<string, { name: string; properties: PropertyCardDto[] }>();
  for (const hotel of hotels) {
    const entry = map.get(hotel.city.slug) ?? { name: hotel.city.name, properties: [] };
    entry.properties.push(hotel);
    map.set(hotel.city.slug, entry);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function Header({
  initialUser,
}: {
  initialUser?: { name: string; email: string } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? initialUser ?? null;
  const { data } = useHotels();
  const grouped = useMemo(() => groupByCity(data?.hotels ?? []), [data]);

  const branchMatch = /^\/([a-z0-9-]+)(?:\/|$)/.exec(pathname);
  const branchSlug = branchMatch?.[1];
  const branch = data?.hotels.find((hotel) => hotel.slug === branchSlug);
  const bookHref = branch ? `/book/${branch.slug}` : "/hotels";

  useEffect(() => {
    function handle(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function signOut() {
    await authClient.signOut();
    setOpen(false);
    setAccountOpen(false);
    router.push("/");
    router.refresh();
  }

  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-50 overflow-visible">
      <div className="pointer-events-none absolute inset-0 -z-10 border-b border-white/40 bg-white/45 shadow-[0_8px_30px_rgba(31,31,31,0.06)] backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/35" />
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg">Stayora</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Hotels
              <ChevronDown className={cn("h-4 w-4 transition-transform", menuOpen && "rotate-180")} />
            </button>
            {menuOpen ? (
              <div className="absolute left-1/2 top-full z-50 w-[46rem] max-w-[90vw] -translate-x-1/2 pt-2">
                <div className="grid max-h-[70vh] grid-cols-2 gap-x-8 gap-y-5 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-[0_24px_60px_rgba(31,31,31,0.14)] lg:grid-cols-3">
                  {grouped.map((group) => (
                    <div key={group.name}>
                      <Link
                        href={`/hotels?city=${group.properties[0].city.slug}`}
                        className="text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
                      >
                        {group.name}
                      </Link>
                      <ul className="mt-2 space-y-1">
                        {group.properties.map((hotel) => (
                          <li key={hotel.id}>
                            <Link
                              href={`/${hotel.slug}`}
                              className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {hotel.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="col-span-full border-t border-border pt-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Guests</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {[1, 2, 3, 4, 5].map((count) => (
                        <Link
                          key={count}
                          href={`/hotels?guests=${count}`}
                          className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          {count}
                          {count === 5 ? "+" : ""}
                        </Link>
                      ))}
                      <Link href="/hotels" className="ml-auto text-sm font-semibold text-primary hover:underline">
                        View all 12 properties
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div
              ref={accountRef}
              className="relative"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-haspopup="true"
                onClick={() => setAccountOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white pl-1 pr-3 text-sm font-semibold hover:border-primary"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {initials || <UserRound className="h-4 w-4" />}
                </span>
                <span className="max-w-[9rem] truncate">Account</span>
                <ChevronDown className={cn("h-4 w-4 opacity-60 transition-transform", accountOpen && "rotate-180")} />
              </button>
              {accountOpen ? (
                <div className="absolute right-0 top-full z-[60] w-56 pt-2">
                  <div className="rounded-2xl border border-border bg-white p-2 shadow-[0_18px_50px_rgba(31,31,31,0.14)]">
                    <p className="truncate px-3 py-2 text-xs text-muted-foreground">{user.email}</p>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                      onClick={() => setAccountOpen(false)}
                    >
                      <UserRound className="h-4 w-4" />
                      Manage account
                    </Link>
                    <Link
                      href="/bookings"
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                      onClick={() => setAccountOpen(false)}
                    >
                      Bookings
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </Link>
                    <button
                      type="button"
                      className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-muted"
                      onClick={signOut}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : isPending ? (
            <span className="inline-flex h-10 w-28 animate-pulse rounded-full bg-muted" />
          ) : (
            <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Sign in
            </Link>
          )}
          <Link href={bookHref} className={`${buttonVariants({ size: "sm" })} hidden sm:inline-flex`}>
            Book Now
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="max-h-[80vh] overflow-y-auto border-t border-white/40 bg-white/60 px-4 py-4 backdrop-blur-xl md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            <Link
              href="/hotels"
              className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Hotels
            </Link>
            {grouped.map((group) => (
              <div key={group.name} className="px-3 py-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{group.name}</p>
                {group.properties.map((hotel) => (
                  <Link
                    key={hotel.id}
                    href={`/${hotel.slug}`}
                    className="block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {hotel.name}
                  </Link>
                ))}
              </div>
            ))}
            <div className="px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Guests</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((count) => (
                  <Link
                    key={count}
                    href={`/hotels?guests=${count}`}
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-muted px-4 text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {count}
                    {count === 5 ? "+" : ""}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/about" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setOpen(false)}>
              About
            </Link>
            {user ? (
              <>
                <Link href="/wishlist" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setOpen(false)}>
                  Wishlist
                </Link>
                <Link href="/bookings" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setOpen(false)}>
                  Bookings
                </Link>
                <Link href="/account" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setOpen(false)}>
                  Account
                </Link>
                <button
                  type="button"
                  className="rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-muted"
                  onClick={signOut}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/sign-in" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            )}
            <Link href={bookHref} className={`${buttonVariants()} mt-2`} onClick={() => setOpen(false)}>
              Book Now
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
