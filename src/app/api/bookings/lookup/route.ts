import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/property-query";
import { bookingLookupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingLookupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Enter the reference and email used to book" }, { status: 400 });
  }

  const booking = await prisma.bookingRequest.findFirst({
    where: {
      reference: parsed.data.reference.trim().toUpperCase(),
      email: parsed.data.email.trim().toLowerCase(),
    },
    include: { hotel: { select: propertyCardSelect } },
  });

  if (!booking) {
    return Response.json({ error: "No booking found for those details" }, { status: 404 });
  }

  return Response.json({ booking });
}
