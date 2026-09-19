# Stayora Implementation Plan

Date: 2026-09-10
Spec: `docs/superpowers/specs/2026-09-10-stayora-hotel-booking-design.md`

## Goal

Build Stayora as a Next.js 16.3 App Router hotel booking site with Tailwind, shadcn/ui, TanStack Query, React Hook Form, GSAP, Prisma, and Postgres.

## Task 0 — Workspace and database

- Work in `/workspace` (already isolated checkout on `master`).
- Install and start PostgreSQL locally. Create database `stayora`.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/stayora` in `.env` and placeholder in `.env.example`.
- Scaffold Next.js 16.3.x with TypeScript, Tailwind, App Router, `src/`.
- Configure `allowedHosts` / `allowedDevOrigins` for `.monkeycode-ai.live`.
- Add Prisma, TanStack Query, RHF, Zod, GSAP, lucide, shadcn.

## Task 1 — Data layer

- `prisma/schema.prisma`: City, Hotel, Review, WishlistItem, BookingRequest.
- `prisma/seed.ts`: 10 cities, 48 hotels, reviews.
- `src/lib/db.ts` Prisma client singleton.
- `src/lib/validators.ts` Zod for search + booking.
- `src/lib/guest.ts` localStorage guest UUID.
- Migrate + seed.

## Task 2 — API

Route Handlers:

- GET `/api/cities`
- GET `/api/cities/[slug]`
- GET `/api/hotels`
- GET `/api/hotels/[slug]`
- GET/POST/DELETE `/api/wishlist`
- GET/POST `/api/bookings`

React Query hooks in `src/hooks/`. Providers in root layout.

## Task 3 — Design system and shell

- Tokens: coral `#FF385C`, cream `#FFF8F4`, Plus Jakarta Sans.
- shadcn: button, input, label, card, badge, calendar, popover, slider, checkbox, sheet, sonner, separator, skeleton, select, textarea, form.
- Header, footer, skip link, toasts.

## Task 4 — Pages

- `/` home with hero search, cities, featured stays, quotes, CTA
- `/search` URL-driven filters
- `/cities/[slug]`
- `/hotels/[slug]`
- `/book/[slug]` + `/book/confirmation/[id]`
- `/wishlist` `/bookings` `/about`
- Branded 404

## Task 5 — Motion

- GSAP + ScrollTrigger via `@gsap/react`
- Hero intro, grid stagger, section reveals
- `prefers-reduced-motion` short-circuit

## Task 6 — Verify and preview

- Lint / typecheck
- Seeded data loads
- Deploy preview via deploy-website
