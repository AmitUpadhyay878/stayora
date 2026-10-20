import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/property-query";
import { getRequestSession } from "@/lib/session";
import { bookingSchema } from "@/lib/validators";
import { computeBookingAmounts, generateBookingReference } from "@/lib/pricing";
import { createRazorpayOrder, razorpayConfigured, razorpayKeyId } from "@/lib/payments";
import { nightsBetween } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await getRequestSession(request);
  if (!session) {
    return Response.json({ error: "Sign in to view your requests" }, { status: 401 });
  }
  const bookings = await prisma.bookingRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { hotel: { select: propertyCardSelect } },
  });
  return Response.json({ bookings });
}

export async function POST(request: Request) {
  const session = await getRequestSession(request);
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const hotel = parsed.data.hotelId
      ? await prisma.hotel.findUnique({
          where: { id: parsed.data.hotelId },
          include: { roomCategories: { select: { slug: true, priceFrom: true } } },
        })
      : await prisma.hotel.findUnique({
          where: { slug: parsed.data.hotelSlug },
          include: { roomCategories: { select: { slug: true, priceFrom: true } } },
        });

    if (!hotel) {
      return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    const checkIn = new Date(parsed.data.checkIn);
    const checkOut = new Date(parsed.data.checkOut);
    const nights = nightsBetween(checkIn, checkOut);
    const selectedRoom = hotel.roomCategories.find((room) => room.slug === parsed.data.roomPreference);
    const roomRate = selectedRoom?.priceFrom || hotel.pricePerNight;
    const extras = parsed.data.extras ?? [];
    const { total, deposit, balance } = computeBookingAmounts({
      roomRate,
      nights,
      rooms: parsed.data.rooms,
      guests: parsed.data.adults + parsed.data.children,
      extras,
    });

    const booking = await prisma.bookingRequest.create({
      data: {
        reference: generateBookingReference(),
        userId: session?.user.id ?? null,
        guest: !session,
        hotelId: hotel.id,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone || null,
        checkIn,
        checkOut,
        rooms: parsed.data.rooms,
        adults: parsed.data.adults,
        children: parsed.data.children,
        guests: parsed.data.adults + parsed.data.children,
        roomPreference: parsed.data.roomPreference || null,
        extras: parsed.data.extras ?? [],
        message: parsed.data.message || null,
        totalAmount: total,
        depositAmount: deposit,
        balanceAmount: balance,
      },
      include: { hotel: { select: propertyCardSelect } },
    });

    type PaymentInfo = {
      provider: "razorpay";
      configured: boolean;
      keyId: string | null;
      orderId: string | null;
      amount: number;
      currency: string;
    };

    const payment: PaymentInfo = {
      provider: "razorpay",
      configured: false,
      keyId: null,
      orderId: null,
      amount: deposit,
      currency: booking.currency,
    };

    if (razorpayConfigured() && deposit > 0) {
      try {
        const order = await createRazorpayOrder({
          amountInPaise: deposit * 100,
          receipt: booking.reference,
          notes: { bookingId: booking.id, reference: booking.reference },
        });
        await prisma.bookingRequest.update({
          where: { id: booking.id },
          data: { razorpayOrderId: order.id },
        });
        payment.configured = true;
        payment.keyId = razorpayKeyId();
        payment.orderId = order.id;
      } catch (error) {
        console.error("Razorpay order creation failed", error);
      }
    }

    return Response.json({ booking, payment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send request";
    return Response.json({ error: message }, { status: 500 });
  }
}
