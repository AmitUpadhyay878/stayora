# Stayora

Stayora is a parent hotel group with four sub-brands — Stayora Eco Inn (value), Stayora Inn (mid), Stayora Plaza (premium), and Stayora Resort (leisure) — across eleven Indian destinations and twelve city-branch properties.

Browse the group, open a branch microsite (rooms, gallery, dining, nearby, contact), and book a stay as a guest or as a signed-in member. Guests only pay a 20% deposit online via Razorpay; the remaining 80% is settled at the hotel on checkout. There is no inventory lock and no host dashboard.

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

Requires PostgreSQL. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in `.env`. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to enable the 20% booking deposit; leave them blank to save bookings without an online payment.

## Routes

- `/` chain home, `/about`, `/hotels` directory
- `/[property]` branch microsite with `/rooms`, `/gallery`, `/dining`, `/nearby-attractions`, `/contact-us`
- `/book/[property]` guest-friendly booking form with a 20% Razorpay deposit
- `/book/confirmation/[id]` booking summary, reference, and deposit payment
- `/book/manage` guest booking lookup by reference and email
- `/sign-in`, `/sign-up` member accounts
- `/wishlist`, `/bookings` member-only areas
