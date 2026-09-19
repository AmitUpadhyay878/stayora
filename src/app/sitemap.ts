import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

const BRANCH_PATHS = ["", "/rooms", "/gallery", "/dining", "/nearby-attractions", "/contact-us"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hotels = await prisma.hotel.findMany({
    select: { slug: true, createdAt: true },
    orderBy: { slug: "asc" },
  });

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/hotels"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/sign-in"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/sign-up"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const hotelRoutes: MetadataRoute.Sitemap = hotels.flatMap((hotel) =>
    BRANCH_PATHS.map((path) => ({
      url: absoluteUrl(`/${hotel.slug}${path}`),
      lastModified: hotel.createdAt ?? now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 0.8 : 0.55,
    })),
  );

  return [...staticRoutes, ...hotelRoutes];
}
