import crypto from "node:crypto";
import { extraById } from "@/lib/constants";

export const DEPOSIT_RATE = 0.2;

export type ExtraLine = {
  id: string;
  label: string;
  amount: number;
};

export type BookingQuote = {
  roomRate: number;
  nights: number;
  rooms: number;
  guests: number;
  roomSubtotal: number;
  extras: ExtraLine[];
  extrasTotal: number;
  total: number;
  deposit: number;
  balance: number;
};

export function extraChargeAmount({
  extraId,
  nights,
  rooms,
  guests,
}: {
  extraId: string;
  nights: number;
  rooms: number;
  guests: number;
}) {
  const extra = extraById(extraId);
  if (!extra) return 0;
  if (extra.per === "night") {
    if (extra.id === "breakfast") {
      return extra.price * Math.max(1, nights) * Math.max(1, guests);
    }
    return extra.price * Math.max(1, nights) * Math.max(1, rooms);
  }
  return extra.price;
}

export function computeBookingAmounts({
  roomRate,
  nights,
  rooms,
  guests = 1,
  extras = [],
}: {
  roomRate: number;
  nights: number;
  rooms: number;
  guests?: number;
  extras?: string[];
}): BookingQuote {
  const safeNights = Math.max(0, nights);
  const safeRooms = Math.max(1, rooms);
  const safeGuests = Math.max(1, guests);
  const roomSubtotal = Math.max(0, Math.round(roomRate * safeNights * safeRooms));
  const extraLines: ExtraLine[] = [];
  for (const id of extras) {
    const extra = extraById(id);
    if (!extra) continue;
    extraLines.push({
      id,
      label: extra.label,
      amount: extraChargeAmount({ extraId: id, nights: safeNights, rooms: safeRooms, guests: safeGuests }),
    });
  }
  const extrasTotal = extraLines.reduce((sum, line) => sum + line.amount, 0);
  const total = roomSubtotal + extrasTotal;
  const deposit = Math.round(total * DEPOSIT_RATE);
  const balance = total - deposit;
  return {
    roomRate,
    nights: safeNights,
    rooms: safeRooms,
    guests: safeGuests,
    roomSubtotal,
    extras: extraLines,
    extrasTotal,
    total,
    deposit,
    balance,
  };
}

const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateBookingReference() {
  const bytes = crypto.randomBytes(6);
  let suffix = "";
  for (const byte of bytes) {
    suffix += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  }
  return `STY-${suffix}`;
}
