import type { Metadata } from "next";
import { BookingLookup } from "@/components/booking/booking-lookup";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Find a booking",
  description: "Look up a Stayora guest booking with your booking reference and the email you booked with.",
  path: "/book/manage",
  index: false,
});

export default function ManageBookingPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">Find your booking</h1>
      <p className="mt-2 text-muted-foreground">
        Enter the booking reference and email used to reserve. Guests do not need an account.
      </p>
      <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
        <BookingLookup />
      </div>
    </div>
  );
}
