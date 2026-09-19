import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/property-query";
import { getRequestSession } from "@/lib/session";
import { wishlistSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const session = await getRequestSession(request);
  if (!session) {
    return Response.json({ error: "Sign in to view your wishlist" }, { status: 401 });
  }
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { hotel: { select: propertyCardSelect } },
  });
  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await getRequestSession(request);
  if (!session) {
    return Response.json({ error: "Sign in to save stays" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = wishlistSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const item = await prisma.wishlistItem.upsert({
    where: {
      userId_hotelId: { userId: session.user.id, hotelId: parsed.data.hotelId },
    },
    create: { userId: session.user.id, hotelId: parsed.data.hotelId },
    update: {},
    include: { hotel: { select: propertyCardSelect } },
  });
  return Response.json({ item });
}

export async function DELETE(request: Request) {
  const session = await getRequestSession(request);
  if (!session) {
    return Response.json({ error: "Sign in to update your wishlist" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = wishlistSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, hotelId: parsed.data.hotelId },
  });
  return Response.json({ ok: true });
}
