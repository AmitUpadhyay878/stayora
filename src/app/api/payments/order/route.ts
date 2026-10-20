import { prisma } from "@/lib/db";
import { createRazorpayOrder, razorpayConfigured, razorpayKeyId } from "@/lib/payments";

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
    return Response.json({ error: "Deposit already paid" }, { status: 400 });
  }
  if (!razorpayConfigured() || booking.depositAmount <= 0) {
    return Response.json({ error: "Online deposit is not available for this booking" }, { status: 503 });
  }

  try {
    const order = await createRazorpayOrder({
      amountInPaise: booking.depositAmount * 100,
      receipt: booking.reference,
      notes: { bookingId: booking.id, reference: booking.reference },
    });
    await prisma.bookingRequest.update({
      where: { id: booking.id },
      data: { razorpayOrderId: order.id, status: "pending_payment" },
    });

    return Response.json({
      payment: {
        provider: "razorpay",
        configured: true,
        keyId: razorpayKeyId(),
        orderId: order.id,
        amount: booking.depositAmount,
        currency: booking.currency,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation failed", error);
    return Response.json({ error: "Could not start the payment. Please try again." }, { status: 502 });
  }
}
