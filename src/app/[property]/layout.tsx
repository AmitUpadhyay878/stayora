import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { prisma } from "@/lib/db";
import { isReservedSlug } from "@/lib/brands";
import { BranchNav } from "@/components/layout/branch-nav";

export async function generateStaticParams() {
  const hotels = await prisma.hotel.findMany({ select: { slug: true } });
  return hotels.map((hotel) => ({ property: hotel.slug }));
}

export default async function PropertyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ property: string }>;
}) {
  const { property } = await params;
  if (isReservedSlug(property)) notFound();

  const hotel = await prisma.hotel.findUnique({
    where: { slug: property },
    select: { name: true, slug: true },
  });
  if (!hotel) notFound();

  return (
    <>
      <BranchNav slug={hotel.slug} name={hotel.name} />
      {children}
    </>
  );
}
