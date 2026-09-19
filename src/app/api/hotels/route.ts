import { prisma } from "@/lib/db";
import {
  propertyCardSelect,
  propertyOrderBy,
  propertyWhere,
  resolveCitySlug,
} from "@/lib/property-query";
import { directoryParamsSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = directoryParamsSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid directory params", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const city = await resolveCitySlug(parsed.data.city);
  const where = propertyWhere({ ...parsed.data, city });
  const [hotels, count] = await Promise.all([
    prisma.hotel.findMany({
      where,
      orderBy: propertyOrderBy(parsed.data.sort),
      select: propertyCardSelect,
    }),
    prisma.hotel.count({ where }),
  ]);
  return Response.json({ hotels, count });
}
