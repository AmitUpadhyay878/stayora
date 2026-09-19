# Stayora

Stayora is a parent hotel group with four sub-brands — Stayora Eco Inn (value), Stayora Inn (mid), Stayora Plaza (premium), and Stayora Resort (leisure) — across eleven Indian destinations and twelve city-branch properties.

Browse the group, open a branch microsite (rooms, gallery, dining, nearby, contact), and send a signed-in booking request. There is no payment, no inventory lock, and no host dashboard.

## Stack

Next.js 16.3 App Router, Tailwind CSS, shadcn-style UI, TanStack Query, React Hook Form, GSAP, Prisma, PostgreSQL, Better Auth.

## Setup

```bash
# Copy env and set Postgres plus Better Auth
cp .env.example .env

# Install
npm install

# Migrate and seed
npx prisma migrate deploy
npm run db:seed

# Dev server
npm run dev
```

Requires PostgreSQL. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in `.env`.

## Routes

- `/` chain home, `/about`, `/hotels` directory
- `/[property]` branch microsite with `/rooms`, `/gallery`, `/dining`, `/nearby-attractions`, `/contact-us`
- `/book/[property]`, `/book/confirmation/[id]`
- `/sign-in`, `/sign-up`, `/wishlist`, `/bookings`
