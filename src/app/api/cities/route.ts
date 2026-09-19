import { prisma } from "@/lib/db";

export async function GET() {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { hotels: true } } },
  });
  return Response.json({ cities });
}
