# Stayora Chain and City-Branch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Stayora from an Airbnb-style marketplace into a Lords-style parent chain with four sub-brands (Eco Inn, Inn, Plaza, Resort) and twelve India city-branch microsites.

**Architecture:** Single Next.js 16 App Router app. Server Components read Prisma directly for SEO pages; client components use TanStack Query against `/api` Route Handlers. Brand is a first-class row; each Hotel is a city branch with nested content (RoomCategory, GalleryImage, NearbyAttraction, Review). Booking stays property-level.

**Tech Stack:** Next.js 16.3, TypeScript, Tailwind v4, shadcn-style UI, TanStack Query, RHF + Zod, GSAP, Prisma 6.19 + Postgres, Better Auth.

**Spec:** `docs/superpowers/specs/2026-09-13-stayora-chain-brands-design.md`

## Global Constraints

- Light mode only; coral `#FF385C`, cream `#FFF8F4`, foreground `#1F1F1F`; Plus Jakarta Sans.
- Currency is INR integers (`pricePerNight Int`), displayed via `formatCurrency` with `INR`, no paise.
- Reserved first-segment slugs: `about`, `hotels`, `sign-in`, `sign-up`, `wishlist`, `bookings`, `book`, `api`. Never a property slug.
- Middleware matcher: `/wishlist/:path*`, `/bookings/:path*`, `/book/:path*` only; do not re-export `config` name changes.
- No payments, no host dashboard, no live inventory, no room-level booking.
- Do not copy Lords trademarks/logos/photos; Stayora-prefixed names; Unsplash photos only.
- Every `next/image` has width/height or aspect ratio.
- TDD where a pure unit is extractable (validators, query builders, reserved slugs). UI pages verified by typecheck/lint + manual pass.

## File Map

Create:

- `src/lib/brands.ts` — brand copy/tier helpers, reserved slugs, badge labels
- `src/lib/property-query.ts` — replaces `hotel-query.ts`; `propertyWhere`, `propertyOrderBy`, `propertyCardSelect`, `propertyDetailInclude`
- `src/components/hotels/property-card.tsx` — replaces `hotel-card.tsx`
- `src/components/hotels/property-grid.tsx` — replaces `hotel-grid.tsx`
- `src/components/layout/branch-nav.tsx` — local branch nav
- `src/components/hotels/property-filters.tsx` — `/hotels` brand/city/sort chips
- `src/app/hotels/page.tsx` — directory (replaces `src/app/hotels/[slug]/page.tsx`)
- `src/app/[property]/layout.tsx` + 6 nested pages
- `src/app/api/brands/route.ts`
- `src/app/api/hotels/[slug]/route.ts` — updated detail shape

Modify:

- `prisma/schema.prisma`, `prisma/seed.ts`
- `src/lib/validators.ts` (directory params, drop search params), `src/lib/constants.ts` (brands/sorts), `src/lib/utils.ts` (INR)
- `src/hooks/use-api.ts`, `src/components/layout/header.tsx`, `footer.tsx`
- `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/book/[slug]/page.tsx`, `src/app/book/confirmation/[id]/page.tsx`, `src/app/wishlist/page.tsx`, `src/app/bookings/page.tsx`, `src/app/not-found.tsx`, `src/app/layout.tsx`

Delete (marketplace-only):

- `src/app/search/`, `src/app/cities/`, `src/app/hotels/[slug]/`, `src/app/api/cities/[slug]/`
- `src/components/hotels/hotel-card.tsx`, `hotel-grid.tsx`
- `src/components/search/`
- `src/lib/hotel-query.ts`, `src/lib/guest.ts`, `src/proxy.ts`

---

## Task 1: Data model — Brand + branch content

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: enums `BrandTier`; models `Brand`, `RoomCategory`, `GalleryImage`, `NearbyAttraction`; `Hotel.brandId`, `Hotel.diningName`, `Hotel.diningBlurb`, `Hotel.contactBlurb`; drops `PropertyType`, `Hotel.type`, `bedrooms`, `beds`, `baths`.

- [ ] Replace the `PropertyType` enum with `BrandTier` and add models.
- [ ] Run `npx prisma format` and `npx prisma migrate dev --name chain_brands`.
- [ ] Verify with `npx prisma generate`.

## Task 2: Seed catalog — 4 brands, 11 cities, 12 branches

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Consumes: Task 1 schema.
- Produces: idempotent seed clearing wishlist/bookings/reviews/gallery/rooms/nearby/hotels/cities, then inserting the 12 branches from the spec table.

- [ ] Write the seed with per-branch rooms (3–5), gallery (8–12), nearby (3–5), reviews (2–4).
- [ ] Run `npm run db:seed`.
- [ ] Verify counts: 4 brands, 11 cities, 12 hotels.

## Task 3: Validators + brand/query helpers

**Files:**
- Modify: `src/lib/validators.ts`, `src/lib/constants.ts`, `src/lib/utils.ts`
- Create: `src/lib/brands.ts`, `src/lib/property-query.ts`

**Interfaces:**
- `directoryParamsSchema` = `{ brand?: enum, city?: string, sort: enum default 'recommended' }`
- `PROPERTY_SORTS`, `BRAND_OPTIONS`
- `RESERVED_SLUGS: string[]`, `isReservedSlug(slug: string): boolean`
- `formatCurrency` uses `INR`.

- [ ] Rewrite validators (drop `searchParamsSchema` date/price/type fields).
- [ ] Add helpers and run `npm run typecheck`.

## Task 4: API — brands, directory, detail

**Files:**
- Create: `src/app/api/brands/route.ts`
- Modify: `src/app/api/hotels/route.ts`, `src/app/api/hotels/[slug]/route.ts`
- Delete: `src/app/api/cities/[slug]/`

- [ ] Implement handlers returning `{ brands }`, `{ hotels, count }`, `{ hotel }` with nested content.

## Task 5: Corporate IA — header mega-menu, footer, layouts

**Files:**
- Modify: `src/components/layout/header.tsx`, `footer.tsx`, `src/app/layout.tsx`
- Create: `src/components/layout/branch-nav.tsx`

- [ ] Header: Hotels mega-menu grouped by city, About, Wishlist, Bookings, Sign In/Out, Book Now.
- [ ] Footer: four brand links + twelve property links.

## Task 6: Corporate pages — home, about, directory, 404

**Files:**
- Modify: `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/not-found.tsx`
- Create: `src/app/hotels/page.tsx`, `src/components/hotels/property-card.tsx`, `property-grid.tsx`, `property-filters.tsx`
- Delete: `src/app/search/`, `src/app/cities/`, `src/app/hotels/[slug]/`

## Task 7: Branch microsite

**Files:**
- Create: `src/app/[property]/layout.tsx`, `page.tsx`, `rooms/page.tsx`, `gallery/page.tsx`, `dining/page.tsx`, `nearby-attractions/page.tsx`, `contact-us/page.tsx`

- [ ] `generateStaticParams` from Hotel rows; reserved slugs `notFound()`.

## Task 8: Booking, wishlist, bookings on new catalog

**Files:**
- Modify: `src/app/book/[slug]/page.tsx`, `src/app/book/confirmation/[id]/page.tsx`, `src/app/wishlist/page.tsx`, `src/app/bookings/page.tsx`, `src/components/booking/booking-form.tsx`, `src/hooks/use-api.ts`

## Task 9: Cleanup, verify, preview

- [ ] Remove dead files, run `npm run lint` + `npm run typecheck` + `npm run build`.
- [ ] Manual pass; deploy preview.

---

## Self-Review

- Spec coverage: all routes, models, APIs, seed table, motion, INR, reserved slugs mapped to a task.
- Placeholder scan: none.
- Type consistency: `directoryParamsSchema`, `propertyCardSelect`, `BrandTier` used consistently.
