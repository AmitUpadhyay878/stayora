import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { bookingId?: string } | null;
  if (!body?.bookingId) {
    return Response.json({ error: "Missing booking" }, { status: 400 });
  }

  const booking = await prisma.bookingRequest.findUnique({ where: { id: body.bookingId } });
  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.paymentStatus === "deposit_paid" || booking.paymentStatus === "paid") {
    return Response.json({ error: "Booking is already paid" }, { status: 400 });
  }

  const updated = await prisma.bookingRequest.update({
    where: { id: booking.id },
    data: { status: "cancelled" },
  });

  return Response.json({ booking: updated });
}
