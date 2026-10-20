import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DepositPayment } from "@/components/booking/deposit-payment";
import { extraLabel } from "@/lib/constants";
import { razorpayConfigured } from "@/lib/payments";
import { DEPOSIT_RATE, extraChargeAmount } from "@/lib/pricing";
import { formatCurrency, formatOccupancy, nightsBetween } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { privateMeta } from "@/lib/seo";

export const metadata = privateMeta("Request received", "/bookings");

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

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: { hotel: { include: { city: true, roomCategories: { select: { name: true, slug: true } } } } },
  });
  if (!booking) notFound();

  const isOwner = Boolean(session?.user && booking.userId === session.user.id);
  if (!booking.guest && !isOwner) notFound();

  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const preferredRoom =
    booking.hotel.roomCategories.find((room) => room.slug === booking.roomPreference)?.name ??
    booking.roomPreference;
  const extraLabels = (booking.extras ?? []).map(extraLabel);
  const extraLines = (booking.extras ?? []).map((id) => ({
    id,
    label: extraLabel(id),
    amount: extraChargeAmount({
      extraId: id,
      nights,
      rooms: booking.rooms,
      guests: booking.adults + booking.children,
    }),
  }));
  const extrasTotal = extraLines.reduce((sum, line) => sum + line.amount, 0);
  const roomSubtotal = Math.max(0, booking.totalAmount - extrasTotal);
  const depositPaid = booking.paymentStatus === "deposit_paid" || booking.paymentStatus === "paid";
  const confirmed = booking.status === "confirmed" && depositPaid;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {booking.guest ? "Guest booking" : "Member booking"} · {booking.reference}
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {confirmed ? "Booking confirmed." : "Booking not confirmed yet."}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {booking.hotel.name} in {booking.hotel.city.name} · {format(booking.checkIn, "MMM d, yyyy")} to{" "}
          {format(booking.checkOut, "MMM d, yyyy")} · {formatOccupancy(booking)} · {nights} nights
          {preferredRoom ? ` · ${preferredRoom}` : ""}
          {extraLabels.length ? ` · ${extraLabels.join(", ")}` : ""}
        </p>
      </div>

      <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Payment</p>
          <div className="flex items-center gap-2">
            <Badge className="capitalize">{STATUS_LABELS[booking.status] ?? booking.status}</Badge>
            <Badge variant="outline" className="capitalize">
              {PAYMENT_LABELS[booking.paymentStatus] ?? booking.paymentStatus}
            </Badge>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <dt>
              {preferredRoom || "Room"} · {nights} night{nights === 1 ? "" : "s"}
            </dt>
            <dd className="tabular-nums font-medium text-foreground">{formatCurrency(roomSubtotal)}</dd>
          </div>
          {extraLines.map((line) => (
            <div key={line.id} className="flex items-center justify-between text-muted-foreground">
              <dt>{line.label}</dt>
              <dd className="tabular-nums font-medium text-foreground">{formatCurrency(line.amount)}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-2">
            <dt className="font-medium">Stay total</dt>
            <dd className="tabular-nums font-semibold">{formatCurrency(booking.totalAmount)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-medium">Deposit {depositPaid ? "paid" : "due"} now ({Math.round(DEPOSIT_RATE * 100)}%)</dt>
            <dd className="tabular-nums font-semibold text-primary">{formatCurrency(booking.depositAmount)}</dd>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <dt>Balance payable at hotel checkout</dt>
            <dd className="tabular-nums font-medium text-foreground">{formatCurrency(booking.balanceAmount)}</dd>
          </div>
        </dl>

        {!depositPaid ? (
          <div className="mt-5 space-y-3 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              This booking is <span className="font-semibold text-foreground">not confirmed</span> until the{" "}
              {Math.round(DEPOSIT_RATE * 100)}% deposit is paid. The remaining balance is settled at the hotel when you
              check out.
            </p>
            {razorpayConfigured() ? (
              <DepositPayment
                bookingId={booking.id}
                hotelName={booking.hotel.name}
                amount={booking.depositAmount}
                prefill={{
                  name: `${booking.firstName} ${booking.lastName}`.trim(),
                  email: booking.email,
                  contact: booking.phone ?? undefined,
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Online deposit is not switched on yet — the hotel will share a payment link by email.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            Deposit received. Balance of {formatCurrency(booking.balanceAmount)} is payable at the hotel on checkout.
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Keep your reference <span className="font-semibold text-foreground">{booking.reference}</span> and this email (
        {booking.email}) to look up this booking later.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {isOwner ? (
          <Link href="/bookings" className={buttonVariants()}>
            View your requests
          </Link>
        ) : (
          <Link href="/book/manage" className={buttonVariants()}>
            Manage this booking
          </Link>
        )}
        <Link href="/hotels" className={buttonVariants({ variant: "outline" })}>
          Keep browsing
        </Link>
      </div>
    </div>
  );
}
