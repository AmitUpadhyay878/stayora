# Stayora — Hotel Booking Website Design

Date: 2026-09-10
Status: Ready for user review
Product: Stayora, a premium multi-city hotel listing and booking-request site

## Goal

Ship a polished Airbnb-like hotel booking website. Guests browse hotels across many cities, filter stays, save a wishlist, and submit booking requests. Photography, search, and motion are the product. Payments, host tools, and account auth are out of v1.

Success looks like: a guest can land on the homepage, search a city with dates and guests, open a hotel, submit a booking request, and later find that request and any wishlisted stays.

## Scope

In:

- Public listing site with 10 cities and 48 hotels
- Full Airbnb-style search and filters
- Hotel detail with photo gallery, amenities, reviews, and sticky booking card
- Booking request form and confirmation page (no payment)
- Guest wishlist and bookings list keyed by a local guest id
- About page
- GSAP scroll animations on marketing and listing surfaces
- Postgres persistence via Prisma

Out:

- Login, signup, OAuth, sessions
- Payments, deposits, or live inventory blocking
- Host or admin dashboard
- Map search, messaging, or reviews written by guests
- Multi-currency or multi-language

## Architecture

Single Next.js 16 App Router application. Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form + Zod, GSAP + ScrollTrigger + `@gsap/react`.

Persistence is Prisma against Postgres. The UI talks to Next.js Route Handlers under `/api`. Client components use React Query. Server Components may read Prisma directly for SEO-critical pages (home, city, hotel detail) and still hydrate client query caches where needed.

When a real external backend arrives later, replace Route Handler implementations and keep the same API shapes and React Query hooks.

Preview constraint: this environment exposes one port. The Next.js frontend is the public entry. `/api` lives in the same Next process, so no extra reverse-proxy target is required for v1.

```text
Browser
  -> Next.js App Router (UI, RSC)
  -> /api/* Route Handlers
  -> Prisma
  -> Postgres
```

Guest identity without auth: first visit creates a UUID in `localStorage` (`stayora_guest_id`). Wishlist and booking requests store that id. Clearing storage loses those records from the guest's view; data remains in the database.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Data fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Motion | GSAP, ScrollTrigger, `@gsap/react` |
| Icons | Lucide |
| ORM | Prisma |
| Database | PostgreSQL |
| Images | next/image, Unsplash-style remote photos with width/height |

Next.js version: use the current Next 16 release available via `create-next-app`. If a literal `16.3` tag is unpublished, pin the latest 16.x and document the resolved version.

Dev server must allow `*.monkeycode-ai.live` via `allowedHosts`.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home: hero search, cities, featured stays, social proof, CTA |
| `/search` | Filterable listing results driven by URL query params |
| `/cities/[slug]` | City hero, intro, hotels in that city |
| `/hotels/[slug]` | Hotel detail, gallery, amenities, reviews, sticky booking card |
| `/book/[slug]` | Booking request form for a hotel |
| `/book/confirmation/[id]` | Confirmation of a submitted request |
| `/wishlist` | Saved hotels for this guest |
| `/bookings` | This guest's booking requests |
| `/about` | Brand story, coverage, trust |

404 uses a branded empty state with a search CTA.

## Homepage

Marketplace / directory pattern.

1. Sticky header: logo, destination links, Wishlist, Bookings, primary "Find a stay"
2. Full-bleed hero with warm photography and overlaid search bar (location, check-in, check-out, guests)
3. Horizontal city strip (10 destinations)
4. Featured stays grid (8 hotels)
5. Trust row (guest count, average rating, cities covered)
6. Guest quotes
7. Closing CTA ("Find your next stay") linking to `/search`, then site footer

There is no host onboarding. A footer line such as "Hosting is coming soon" may link to `/about`. Do not add a host signup flow.

Hero search is the primary CTA. Submitting navigates to `/search` with query params.

## Search and filters

URL is the source of truth so results are shareable and back-navigation restores state.

Query params:

- `city` city slug
- `checkIn` ISO date
- `checkOut` ISO date
- `guests` integer, min 1
- `minPrice` `maxPrice` nightly USD
- `rating` minimum average, e.g. 4
- `type` one or more of `hotel`, `apartment`, `villa`, `cabin`, `loft`
- `amenities` one or more of `wifi`, `pool`, `kitchen`, `parking`, `air_conditioning`, `workspace`, `gym`, `breakfast`, `pet_friendly`, `ocean_view`
- `sort` `recommended` (default), `price_asc`, `price_desc`, `rating_desc`

Layout: filter bar + result count on top, hotel cards in a 1/2/3 column grid. Empty state explains filters and offers a clear-all action.

Client validation: React Hook Form + Zod on the hero and filter bar. Dates must be valid; checkout after check-in; guests 1–16.

Filtering runs on the server in the search Route Handler / Prisma query. React Query key is the serialized search params.

## Hotel cards and detail

Card: photo, wishlist heart, city, title, type, rating + review count, guests, nightly price. Heart toggles wishlist for the guest id.

Detail:

- Photo gallery (main + thumbnails)
- Title, city, type, rating
- Description
- Amenities
- Sleeps / beds / baths
- Reviews list
- Sticky booking card: dates, guests, estimated nights x price, "Request to book"

"Request to book" goes to `/book/[slug]` with dates and guests as query params when present.

## Booking request

No payment and no inventory lock. Submitting creates a `BookingRequest` with status `pending`.

Form fields (RHF + Zod):

- First name, last name, email (required)
- Check-in, check-out, guests (required, prefilled from query)
- Special requests (optional)

On success, redirect to `/book/confirmation/[id]` with hotel name, dates, guest count, and a request id.

Duplicate overlapping requests from the same guest and hotel are allowed in v1; the confirmation copy says the host will confirm availability.

## Wishlist and bookings

`/wishlist` lists saved hotels. Empty state links to `/search`.

`/bookings` lists this guest's requests with status badge (`pending`). Empty state links home.

Both pages 404-style empty if there is no guest id yet; creating one happens on first wishlist or booking submit.

## Data model

```text
City
  id, name, slug, country, tagline, heroImage, createdAt

Hotel
  id, name, slug, cityId
  type (hotel | apartment | villa | cabin | loft)
  description, address
  pricePerNight (Int, USD)
  guests, bedrooms, beds, baths
  rating (Float), reviewCount (Int)
  amenities (String[])
  images (String[])
  featured (Boolean)
  createdAt

Review
  id, hotelId, author, avatar, rating, body, createdAt

WishlistItem
  id, guestId, hotelId, createdAt
  unique (guestId, hotelId)

BookingRequest
  id, guestId, hotelId
  firstName, lastName, email
  checkIn, checkOut, guests
  message, status (pending)
  createdAt
```

Seed: 10 cities, 48 hotels (4–6 per city), 2–4 reviews per hotel.

Cities:

1. Paris
2. Tokyo
3. New York
4. Bali
5. Dubai
6. Barcelona
7. London
8. Rome
9. Lisbon
10. Cape Town

Photos: stable remote URLs (Unsplash). Every `next/image` has width, height or aspect-ratio. City and hotel copy is unique enough to avoid a cloned template feel.

## API

All JSON. Errors: `{ error: string, details?: unknown }` with 4xx/5xx.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/cities` | All cities |
| GET | `/api/cities/[slug]` | City + hotels |
| GET | `/api/hotels` | List/search with filters |
| GET | `/api/hotels/[slug]` | Hotel + city + reviews |
| GET | `/api/wishlist?guestId=` | Guest wishlist |
| POST | `/api/wishlist` | `{ guestId, hotelId }` add |
| DELETE | `/api/wishlist` | `{ guestId, hotelId }` remove |
| GET | `/api/bookings?guestId=` | Guest booking requests |
| POST | `/api/bookings` | Create booking request |

POST `/api/bookings` validates with Zod. Returns the created request including hotel summary.

React Query:

- `['cities']`
- `['city', slug]`
- `['hotels', searchParams]`
- `['hotel', slug]`
- `['wishlist', guestId]`
- `['bookings', guestId]`

Mutations invalidate wishlist or bookings queries. Optimistic toggle on the heart.

## UI and motion

Airbnb-like warm Soft UI.

Color tokens:

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

Typography: Plus Jakarta Sans for headings and body. Body 16px, line-height 1.5. Display sizes for hero only.

Effects: 16–24px card radius, soft elevation, hover lift `translateY(-4px)` at 200ms, visible focus rings, Lucide icons (no emoji icons).

Motion (GSAP, respect `prefers-reduced-motion`):

- Home hero headline fade/slide in on load
- City strip and hotel grids: scroll reveal stagger, `y: 24`, 400–600ms, `power2.out`, stagger 0.06–0.08, max ~8 items per trigger group
- Section headlines reveal when they enter the viewport
- No pin-scrub sections on mobile; at most one light parallax on the home hero
- Use `@gsap/react` `useGSAP` for cleanup

Light mode is default. Dark mode is not in v1.

## Forms and feedback

Visible labels, errors under fields, required markers, submit buttons disable with a spinner. Toasts (shadcn sonner) for wishlist add/remove and API failures, 3–5s, `aria-live="polite"`. Booking success is a dedicated page, not only a toast.

## Error handling

- Prisma / API failures: 500 JSON; UI shows retry
- Invalid search params: ignore unknown, coerce numbers, do not crash
- Missing hotel/city/booking id: not-found page
- Wishlist/booking without guestId: create guest id, then retry
- Image errors: gradient placeholder

## Testing

- Zod schema tests for search params and booking payload
- Prisma query helpers: filter combinations, empty results
- Component tests optional for HotelCard wishlist toggle if a runner is present

Manual pass: home search, filters, detail, book, confirmation, wishlist, bookings, mobile 375px, reduced motion.

## File layout

```text
src/app/                  routes and route handlers
src/components/           layout, hotel, search, motion
src/lib/                  db, validators, guest-id, utils
src/hooks/                React Query hooks
prisma/schema.prisma
prisma/seed.ts
```

## Implementation notes

- Mobile-first: 375 / 768 / 1024 / 1440
- Touch targets 44px; hearts and icon buttons have expanded hit area
- Contrast 4.5:1 on body text and the coral CTA
- `cursor-pointer` on clickable elements
- No layout shift: reserve image aspect ratios and filter-bar height
- Seed and `prisma migrate` run as part of local startup
- Postgres URL from project env (`DATABASE_URL` in `.env.example` as a placeholder). The user supplies the real connection string. Do not read Agent LLM keys or write platform secrets into the project.

## Open decisions (resolved)

- Brand name: Stayora
- Architecture: Next.js + Prisma + Postgres in one app
- Auth: none in v1; guest UUID
- Catalog: 10 cities, 48 hotels
- Visual: Airbnb-like warm, not luxury dark or editorial magazine
