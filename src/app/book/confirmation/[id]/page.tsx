import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { extraLabel } from "@/lib/constants";
import { formatCurrency, formatOccupancy, nightsBetween } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { privateMeta } from "@/lib/seo";

export const metadata = privateMeta("Request received", "/bookings");

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/sign-in?callbackUrl=/book/confirmation/${id}`);
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: { hotel: { include: { city: true, roomCategories: { select: { name: true, slug: true } } } } },
  });
  if (!booking || booking.userId !== session.user.id) notFound();
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const preferredRoom =
    booking.hotel.roomCategories.find((room) => room.slug === booking.roomPreference)?.name ??
    booking.roomPreference;
  const extraLabels = (booking.extras ?? []).map(extraLabel);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Request {booking.id.slice(-6)}</p>
      <h1 className="mt-3 text-3xl font-semibold">Your stay request is in.</h1>
      <p className="mt-3 text-muted-foreground">
        {booking.hotel.name} in {booking.hotel.city.name} · {format(booking.checkIn, "MMM d, yyyy")} to{" "}
        {format(booking.checkOut, "MMM d, yyyy")} · {formatOccupancy(booking)} · {nights} nights
        {preferredRoom ? ` · ${preferredRoom}` : ""}
        {extraLabels.length ? ` · ${extraLabels.join(", ")}` : ""}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Estimated {formatCurrency(booking.hotel.pricePerNight * nights)}. Status: pending. The hotel will confirm
        availability — overlapping requests are allowed in this version.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/bookings" className={buttonVariants()}>
          View your requests
        </Link>
        <Link href="/hotels" className={buttonVariants({ variant: "outline" })}>
          Keep browsing
        </Link>
      </div>
    </div>
  );
}
