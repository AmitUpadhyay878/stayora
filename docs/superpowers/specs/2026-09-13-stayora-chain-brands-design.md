# Stayora — Hotel Chain and City-Branch Design

Date: 2026-09-13
Status: Ready for user review
Product: Stayora, a parent hotel group with four sub-brands and India-style city-branch microsites

## Goal

Rebuild Stayora from an Airbnb-style marketplace of independent stays into a Lords Hotels-style chain. Stayora is the parent brand. Eco Inn, Inn, Plaza, and Resort are sub-brands. Each property is a city branch with its own nested microsite. Guests browse the group, open a branch, read rooms / gallery / dining / nearby / contact, and submit a signed-in booking request for that property.

Success looks like: a guest lands on the corporate home, opens Hotels grouped by city, visits `Stayora Eco Inn Ambaji` at `/eco-inn-ambaji`, walks Rooms and Gallery, signs in, and submits a request on `/book/eco-inn-ambaji`.

This spec supersedes the marketplace information architecture in `docs/superpowers/specs/2026-09-10-stayora-hotel-booking-design.md`. Auth (Better Auth email/password), request-to-book without payment, and the Stayora visual system stay.

## Scope

In:

- Corporate home, About, and `/hotels` directory
- Four sub-brands: Eco Inn (value), Inn (mid), Plaza (premium), Resort (leisure)
- Twelve India-style city branches, each with a nested microsite
- Nested branch pages: landing, Rooms, Gallery, Dining, Nearby Attractions, Contact
- Hotels mega-menu grouped by city
- Property-level wishlist and booking request (signed-in)
- Prisma schema for Brand plus nested branch content; re-seed replacing the world catalog

Out:

- Room-level booking, PMS, or live inventory
- Payments, deposits, or host/admin dashboard
- Stayora Studio Inn and Stayora Prime
- Marketplace routes `/search`, `/cities/[slug]`, `/hotels/[slug]`
- Guest-facing city hub pages
- Maps, guest-written reviews, messaging
- Multi-currency, multi-language, dark mode
- More than one restaurant per branch

## Architecture

Single Next.js 16 App Router application. Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form + Zod, GSAP + ScrollTrigger + `@gsap/react`. Prisma against Postgres. Better Auth email/password.

UI talks to Next.js Route Handlers under `/api`. Server Components may read Prisma directly for SEO-critical pages (home, about, hotels directory, branch microsites).

Preview constraint unchanged: one public port; `/api` in the same Next process.

```text
Browser
  -> Next.js App Router (corporate chrome + branch microsites)
  -> /api/* Route Handlers
  -> Prisma
  -> Postgres
```

Auth: Better Auth session cookie. Middleware matcher stays `/wishlist/:path*`, `/bookings/:path*`, `/book/:path*`. Do not re-export `config` from `middleware.ts`.

## Stack

Unchanged from the v1 Stayora app except catalog and IA.

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Data fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Motion | GSAP, ScrollTrigger, `@gsap/react` |
| Auth | Better Auth email/password |
| ORM | Prisma 6.19 |
| Database | PostgreSQL (Neon) |
| Images | next/image, Unsplash remote photos |

Dev server must allow `*.monkeycode-ai.live` via `allowedDevOrigins` / `allowedHosts`.

## Product model

Stayora is the parent chain, not a listing marketplace.

Sub-brands:

| Brand | Slug | Tier | Role |
| --- | --- | --- | --- |
| Stayora Eco Inn | `eco-inn` | value | Economical stays without dropping comfort |
| Stayora Inn | `inn` | mid | Quality and affordability for leisure and business |
| Stayora Plaza | `plaza` | premium | Refined design and top-tier amenities |
| Stayora Resort | `resort` | leisure | Scenic retreats |

A Hotel row is a city branch of one sub-brand (example: Stayora Eco Inn Ambaji). City is location data only, not a guest-facing hub.

Booking targets the property, not a room SKU. Room categories are content on `/[property]/rooms`.

## Routes

Corporate:

| Path | Purpose |
| --- | --- |
| `/` | Chain home: hero, brand tiles, featured properties, stats, quotes, CTA |
| `/about` | Stayora story, four brands, coverage stats |
| `/hotels` | All 12 properties, filterable by `brand` and `city` query params |
| `/sign-in` | Better Auth sign-in |
| `/sign-up` | Better Auth sign-up |
| `/wishlist` | Saved properties for the signed-in user |
| `/bookings` | This user's booking requests |

Branch microsite. `Hotel.slug` is Lords-style with no Stayora prefix (`eco-inn-ambaji`, `inn-jaipur`, `plaza-surat`, `resort-top3-bhavnagar`).

| Path | Purpose |
| --- | --- |
| `/[property]` | Branch landing: hero, about, room teasers, dining teaser, nearby |
| `/[property]/rooms` | Room categories as content |
| `/[property]/gallery` | Photo grid |
| `/[property]/dining` | Single restaurant |
| `/[property]/nearby-attractions` | Local attractions |
| `/[property]/contact-us` | Address, phone, email, blurb |
| `/book/[property]` | Booking request form (auth-gated) |
| `/book/confirmation/[id]` | Confirmation of a submitted request |

Reserved first-segment slugs that must never be property slugs: `about`, `hotels`, `sign-in`, `sign-up`, `wishlist`, `bookings`, `book`, `api`.

Removed marketplace routes: `/search`, `/cities/[slug]`, `/hotels/[slug]`. Redirect `/hotels/[slug]` is unnecessary; that path becomes the directory. Old world-catalog slugs 404 after re-seed.

404 uses a branded empty state with a CTA to `/hotels`.

## Homepage

Corporate / chain pattern, not marketplace directory.

1. Sticky corporate header (see UI)
2. Full-bleed hero with warm photography, headline, and primary CTA to `/hotels` plus a secondary Book Now that opens the Hotels mega-menu or `/hotels`
3. Four brand tiles (Eco Inn, Inn, Plaza, Resort) linking to `/hotels?brand=eco-inn` (and siblings)
4. Featured properties grid (6 of 12, `featured: true`)
5. Stats band: rooms, hotels, destinations (no icons)
6. Guest quotes
7. Closing CTA linking to `/hotels`, then footer

Hero search (location / dates / guests) is removed. Dates and guests live on `/book/[property]`.

## Hotels directory

`/hotels` lists all twelve properties.

URL query params:

- `brand` one of `eco-inn`, `inn`, `plaza`, `resort`
- `city` city slug
- `sort` `recommended` (default), `price_asc`, `price_desc`, `rating_desc`

Unknown params ignored. Invalid brand or city ignored (show all). Layout: filter chips for brand and city, result count, 1/2/3 column property cards. Empty state explains filters and offers clear-all.

## Branch microsite

Every branch page uses corporate chrome plus a second local nav: Home, Rooms, Gallery, Dining, Nearby, Contact, Book.

Landing `/[property]`:

- Property hero (name, city, brand badge, Book Now)
- About copy
- Room teasers (first 3 categories) linking to `/[property]/rooms`
- Dining teaser linking to `/[property]/dining`
- Nearby teaser linking to `/[property]/nearby-attractions`
- Wishlist heart

Nested pages are content only. Book / Book Now always goes to `/book/[property]` with optional `checkIn`, `checkOut`, `guests` query params. Room categories are not bookable SKUs.

## Booking request

Unchanged contract, new catalog.

No payment and no inventory lock. Submitting creates a `BookingRequest` with status `pending` for the signed-in user and the property.

Form fields (RHF + Zod):

- First name, last name, email (required; prefill from session when present)
- Check-in, check-out, guests (required, prefilled from query)
- Special requests (optional)

On success, redirect to `/book/confirmation/[id]`. Duplicate overlapping requests from the same user and property are allowed; copy says the hotel will confirm availability.

Unauthenticated visits to `/book/*`, `/wishlist`, `/bookings` 307 to `/sign-in`.

## Data model

```text
Brand
  id, name, slug, tagline, description
  tier (value | mid | premium | leisure)
  createdAt

City
  id, name, slug, country, tagline, heroImage, createdAt

Hotel (city branch)
  id, name, slug, brandId, cityId
  description, address, phone, email
  diningName, diningBlurb, contactBlurb
  pricePerNight (Int, INR; integer rupees, no paise)
  guests (max occupancy for the booking form)
  rating (Float), reviewCount (Int)
  amenities (String[])
  images (String[])
  featured (Boolean)
  createdAt

RoomCategory
  id, hotelId, name, slug, summary
  sizeSqFt, sleeps, bedType, image, sortOrder

GalleryImage
  id, hotelId, url, alt, sortOrder

NearbyAttraction
  id, hotelId, name, distance, blurb, sortOrder

Review
  id, hotelId, author, avatar, rating, body, createdAt

User / Session / Account / Verification
  Better Auth tables, unchanged

WishlistItem
  id, userId, hotelId, createdAt
  unique (userId, hotelId)

BookingRequest
  id, userId, hotelId
  firstName, lastName, email
  checkIn, checkOut, guests
  message, status (pending)
  createdAt
```

Drop `PropertyType` enum (`hotel | apartment | villa | cabin | loft`). Brand is the type.

`Hotel.slug` unique. `Brand.slug` unique. `RoomCategory` unique on `(hotelId, slug)`.

Price: store `pricePerNight` as integer INR. Display with `INR` / rupee formatting. Do not keep USD.

## Seed catalog

Four brands. Cities needed by the twelve branches (create only these):

1. Ambaji
2. Bangalore
3. Dehradun
4. Jaipur
5. Amritsar
6. Somnath
7. Surat
8. Ankleshwar
9. Bhavnagar
10. Shivamogga
11. Sasan Gir (Gir Forest)

Twelve properties:

| Brand | Name | Slug | City |
| --- | --- | --- | --- |
| Eco Inn | Stayora Eco Inn Ambaji | `eco-inn-ambaji` | Ambaji |
| Eco Inn | Stayora Eco Inn Jayanagar Bangalore | `eco-inn-jayanagar-bangalore` | Bangalore |
| Eco Inn | Stayora Eco Inn Dehradun | `eco-inn-dehradun` | Dehradun |
| Inn | Stayora Inn Jaipur | `inn-jaipur` | Jaipur |
| Inn | Stayora Inn Amritsar | `inn-amritsar` | Amritsar |
| Inn | Stayora Inn Somnath | `inn-somnath` | Somnath |
| Plaza | Stayora Plaza Jaipur | `plaza-jaipur` | Jaipur |
| Plaza | Stayora Plaza Surat | `plaza-surat` | Surat |
| Plaza | Stayora Plaza Ankleshwar | `plaza-ankleshwar` | Ankleshwar |
| Resort | Stayora Resort Bhavnagar | `resort-top3-bhavnagar` | Bhavnagar |
| Resort | Stayora Sahyadri Resort Shivamogga | `sahyadri-resort-shivamogga` | Shivamogga |
| Resort | Stayora Resort Gir Forest | `resort-gir-forest` | Sasan Gir |

Per property: 3–5 `RoomCategory` rows, 8–12 `GalleryImage` rows, 3–5 `NearbyAttraction` rows, 2–4 `Review` rows, one dining name/blurb on Hotel.

Re-seed replaces Paris / Tokyo / New York catalog. Existing wishlist and booking rows that point at deleted hotels must be cleared in the seed (delete children, then hotels, then unused cities).

Photos: stable Unsplash URLs. Every `next/image` has width, height or aspect-ratio. Copy is unique per branch.

## API

All JSON. Errors: `{ error: string, details?: unknown }` with 4xx/5xx.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/brands` | All brands |
| GET | `/api/cities` | All cities |
| GET | `/api/hotels` | List with `brand`, `city`, `sort` |
| GET | `/api/hotels/[slug]` | Property + brand + city + rooms + gallery + nearby + reviews |
| GET | `/api/wishlist` | Session wishlist |
| POST | `/api/wishlist` | `{ hotelId }` add |
| DELETE | `/api/wishlist` | `{ hotelId }` remove |
| GET | `/api/bookings` | Session booking requests |
| POST | `/api/bookings` | Create booking request |

Wishlist and bookings stay session-scoped (no `guestId`). Unauth returns 401.

React Query keys:

- `['brands']`
- `['cities']`
- `['hotels', searchParams]`
- `['hotel', slug]`
- `['wishlist']`
- `['bookings']`

Mutations invalidate wishlist or bookings. Optimistic toggle on the heart.

Remove `/api/cities/[slug]` if it only existed for the marketplace city hub. Keep `/api/cities` for the directory filter and mega-menu.

## UI and motion

Stayora warm Soft UI, light mode only.

Color tokens unchanged:

- Primary / CTA: `#FF385C`
- On primary: `#FFFFFF`
- Background: `#FFF8F4`
- Foreground: `#1F1F1F`
- Card: `#FFFFFF`
- Muted: `#F4EDE7`
- Muted foreground: `#6B625C`
- Border: `#E8DDD6`
- Ring: `#FF385C`
- Destructive: `#DC2626`

Typography: Plus Jakarta Sans. Body 16px, line-height 1.5.

Corporate header: logo, Hotels mega-menu grouped by city (property name + Visit), About, Wishlist, Bookings, Sign in/out, Book Now. Book Now on corporate pages goes to `/hotels`. Book Now on a branch goes to `/book/[property]`.

Branch local nav under the header on `/[property]/*` only.

Footer: four brand links (`/hotels?brand=...`) and the twelve properties.

Property card: photo, wishlist heart, brand badge, city, title, rating + review count, nightly INR price.

Motion (GSAP, respect `prefers-reduced-motion`):

- Home hero headline fade/slide in on load
- Brand tiles and property grids: scroll reveal stagger, `y: 24`, 400–600ms, `power2.out`, stagger 0.06–0.08
- No pin-scrub on nested branch pages
- Use `@gsap/react` `useGSAP` for cleanup

## Forms and feedback

Visible labels, errors under fields, required markers, submit buttons disable with a spinner. Toasts for wishlist add/remove and API failures, 3–5s, `aria-live="polite"`. Booking success is a dedicated page.

## Error handling

- Prisma / API failures: 500 JSON; UI shows retry
- Invalid `/hotels` params: ignore unknown, do not crash
- Missing property slug or nested page for unknown slug: not-found
- Unauth wishlist / bookings / book: middleware 307 to `/sign-in`
- Image errors: gradient placeholder

## File layout

```text
src/app/page.tsx
src/app/about/page.tsx
src/app/hotels/page.tsx
src/app/[property]/page.tsx
src/app/[property]/rooms/page.tsx
src/app/[property]/gallery/page.tsx
src/app/[property]/dining/page.tsx
src/app/[property]/nearby-attractions/page.tsx
src/app/[property]/contact-us/page.tsx
src/app/book/[slug]/page.tsx
src/components/layout/header.tsx          corporate chrome + mega-menu
src/components/layout/branch-nav.tsx      local branch nav
src/components/hotels/property-card.tsx
src/lib/brands.ts                         reserved slugs, brand copy helpers
prisma/schema.prisma
prisma/seed.ts
```

Dynamic `[property]` must exclude reserved slugs via `generateStaticParams` from Hotel rows plus an explicit reserved-slug not-found.

Remove marketplace pages and components whose only job was `/search` or `/cities/[slug]`.

## Implementation notes

- Mobile-first: 375 / 768 / 1024 / 1440
- Touch targets 44px
- Contrast 4.5:1 on body text and the coral CTA
- `cursor-pointer` on clickable elements
- No layout shift: reserve image aspect ratios
- Seed and `prisma migrate` run as part of local startup
- Next.js 16 catch-all vs `[property]`: use a single dynamic segment and nested static segments (`rooms`, `gallery`, ...) so `/eco-inn-ambaji/rooms` does not collide with `/hotels`
- Middleware matcher does not include `/[property]` (public)
- Do not copy Lords Hotels trademarks, logos, or proprietary photos into the product. Names are Stayora-prefixed. Photography stays Unsplash.

## Testing

- Zod schema tests for hotels directory params and booking payload
- Prisma helpers: brand + city filter combinations, empty results
- Reserved slug is not treated as a property
- Auth: unauth `/book/*` 307; unauth POST `/api/bookings` 401

Manual pass: home, mega-menu, `/hotels` filters, one Eco Inn and one Resort microsite (all nested pages), book, confirmation, wishlist, 375px, reduced motion.

## Open decisions (resolved)

- Product: Stayora as parent chain, not marketplace
- Geography: India-style destinations
- Sub-brands: Eco Inn, Inn, Plaza, Resort (not Studio/Prime)
- IA: property microsites with full nested pages
- Catalog size: 12 properties
- Implementation: chain rebuild (Approach A); rooms are content, booking is property-level
- Visual: keep Stayora warm Soft UI
- Currency: INR integers
