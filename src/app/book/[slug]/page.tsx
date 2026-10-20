import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isReservedSlug } from "@/lib/brands";
import { BookingForm } from "@/components/booking/booking-form";
import { hotelPageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      description: true,
      images: true,
      brand: { select: { name: true } },
      city: { select: { name: true } },
    },
  });
  return hotelPageMeta(hotel, {
    suffix: "Request to book",
    path: hotel ? `/book/${hotel.slug}` : "/hotels",
    description: hotel
      ? `Request a stay at ${hotel.name} in ${hotel.city.name}. Tell us dates, occupancy, and room preference. Pay a 20% deposit now and the rest at checkout.`
      : undefined,
  });
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  if (isReservedSlug(slug)) notFound();

  const query = await searchParams;
  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    include: {
      brand: true,
      city: true,
        roomCategories: { orderBy: { sortOrder: "asc" }, select: { name: true, slug: true, priceFrom: true } },
    },
  });
  if (!hotel) notFound();

  const str = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");
  const requestedRoom = str(query.room);
  const roomPreference = hotel.roomCategories.some((room) => room.slug === requestedRoom)
    ? requestedRoom
    : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm text-muted-foreground">
        {hotel.brand.name} · {hotel.city.name}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Request {hotel.name}</h1>
      <p className="mt-2 text-muted-foreground">
        Reserve as a guest — no account needed. Pay a 20% deposit now; the balance at the hotel when you check out.
      </p>
      <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
        <BookingForm
          hotelId={hotel.id}
          hotelSlug={hotel.slug}
          hotelName={hotel.name}
          pricePerNight={hotel.pricePerNight}
          roomOptions={hotel.roomCategories}
          defaults={{
            checkIn: str(query.checkIn),
            checkOut: str(query.checkOut),
            rooms: Number(str(query.rooms) || 1),
            adults: Number(str(query.adults) || str(query.guests) || 2),
            children: Number(str(query.children) || 0),
            roomPreference,
          }}
        />
      </div>
    </div>
  );
}
