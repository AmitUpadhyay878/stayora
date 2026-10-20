import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/property-query";
import { verifyRazorpaySignature } from "@/lib/payments";
import { paymentVerifySchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = paymentVerifySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payment payload" }, { status: 400 });
  }

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: parsed.data.bookingId },
  });
  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.razorpayOrderId !== parsed.data.razorpay_order_id) {
    return Response.json({ error: "Order does not match this booking" }, { status: 400 });
  }

  const valid = verifyRazorpaySignature({
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });

  if (!valid) {
    await prisma.bookingRequest.update({
      where: { id: booking.id },
      data: { paymentStatus: "failed", status: "cancelled" },
    });
    return Response.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const updated = await prisma.bookingRequest.update({
    where: { id: booking.id },
    data: {
      paymentStatus: "deposit_paid",
      status: "confirmed",
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      paidAt: new Date(),
    },
    include: { hotel: { select: propertyCardSelect } },
  });

  return Response.json({ ok: true, booking: updated });
}
