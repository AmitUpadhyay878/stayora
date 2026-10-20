import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/property-query";
import { fetchRazorpayOrderPayments, razorpayConfigured } from "@/lib/payments";

const PAID_STATUSES = new Set(["captured", "authorized"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { bookingId?: string } | null;
  if (!body?.bookingId) {
    return Response.json({ error: "Missing booking" }, { status: 400 });
  }

  const booking = await prisma.bookingRequest.findUnique({ where: { id: body.bookingId } });
  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  // Already settled — nothing to reconcile.
  if (booking.paymentStatus === "deposit_paid" || booking.paymentStatus === "paid") {
    return Response.json({ booking, paid: true });
  }

  let captured: { id: string } | null = null;
  if (booking.razorpayOrderId && razorpayConfigured()) {
    try {
      const payments = await fetchRazorpayOrderPayments(booking.razorpayOrderId);
      captured = payments.find((payment) => PAID_STATUSES.has(payment.status)) ?? null;
    } catch (error) {
      console.error("Razorpay reconciliation failed", error);
      return Response.json({ booking });
    }
  }

  if (captured) {
    const updated = await prisma.bookingRequest.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "deposit_paid",
        status: "confirmed",
        razorpayPaymentId: captured.id,
        paidAt: new Date(),
      },
      include: { hotel: { select: propertyCardSelect } },
    });
    return Response.json({ booking: updated, paid: true });
  }

  // No captured payment — the attempt was abandoned or failed.
  const updated = await prisma.bookingRequest.update({
    where: { id: booking.id },
    data: { status: "cancelled" },
    include: { hotel: { select: propertyCardSelect } },
  });
  return Response.json({ booking: updated, paid: false });
}
