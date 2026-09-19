import { prisma } from "@/lib/db";
import { propertyDetailInclude } from "@/lib/property-query";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    include: propertyDetailInclude,
  });
  if (!hotel) {
    return Response.json({ error: "Property not found" }, { status: 404 });
  }
  return Response.json({ hotel });
}
