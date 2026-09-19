import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/property-query";
import { getRequestSession } from "@/lib/session";
import { bookingSchema } from "@/lib/validators";

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
  if (!session) {
    return Response.json({ error: "Sign in to send a booking request" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const hotel = parsed.data.hotelId
      ? await prisma.hotel.findUnique({ where: { id: parsed.data.hotelId } })
      : await prisma.hotel.findUnique({ where: { slug: parsed.data.hotelSlug } });

    if (!hotel) {
      return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    const booking = await prisma.bookingRequest.create({
      data: {
        userId: session.user.id,
        hotelId: hotel.id,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        checkIn: new Date(parsed.data.checkIn),
        checkOut: new Date(parsed.data.checkOut),
        rooms: parsed.data.rooms,
        adults: parsed.data.adults,
        children: parsed.data.children,
        guests: parsed.data.adults + parsed.data.children,
        roomPreference: parsed.data.roomPreference || null,
        extras: parsed.data.extras ?? [],
        message: parsed.data.message || null,
      },
      include: { hotel: { select: propertyCardSelect } },
    });

    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send request";
    return Response.json({ error: message }, { status: 500 });
  }
}
