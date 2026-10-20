"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useBookings } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { extraLabel } from "@/lib/constants";
import { formatCurrency, formatOccupancy } from "@/lib/utils";

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Deposit pending",
  deposit_paid: "Deposit paid",
  paid: "Paid in full",
  failed: "Payment failed",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Not confirmed",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export default function BookingsPage() {
  const { data, isLoading } = useBookings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Your requests</h1>
      <p className="mt-2 text-muted-foreground">
        Booking requests saved to your member account. Booked as a guest?{" "}
        <Link href="/book/manage" className="font-medium text-primary hover:underline">
          Find it with your reference
        </Link>
        .
      </p>
      <div className="mt-8 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : data?.bookings.length ? (
          data.bookings.map((booking) => (
            <article key={booking.id} className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/${booking.hotel.slug}`} className="text-lg font-semibold hover:underline">
                    {booking.hotel.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {booking.hotel.city.name} · {format(new Date(booking.checkIn), "MMM d")} –{" "}
                    {format(new Date(booking.checkOut), "MMM d, yyyy")} · {formatOccupancy(booking)}
                    {booking.roomPreference ? ` · ${booking.roomPreference}` : ""}
                    {booking.extras?.length ? ` · ${booking.extras.map(extraLabel).join(", ")}` : ""}
                  </p>
                  <p className="mt-1 text-sm">
                    {formatCurrency(booking.depositAmount)} deposit ·{" "}
                    {formatCurrency(booking.balanceAmount)} at hotel
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Ref {booking.reference}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="capitalize">{STATUS_LABELS[booking.status] ?? booking.status}</Badge>
                  <Badge variant="outline" className="capitalize">
                    {PAYMENT_LABELS[booking.paymentStatus] ?? booking.paymentStatus}
                  </Badge>
                </div>
              </div>
              <Link
                href={`/book/confirmation/${booking.id}`}
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                View confirmation
              </Link>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-lg font-semibold">No requests yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Find a property and send a booking request.</p>
            <Link href="/hotels" className={`${buttonVariants()} mt-6`}>
              Browse our hotels
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
