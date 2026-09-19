import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function formatOccupancy({
  rooms,
  adults,
  children,
}: {
  rooms: number;
  adults: number;
  children: number;
}) {
  const roomLabel = `${rooms} ${rooms === 1 ? "room" : "rooms"}`;
  const adultLabel = `${adults} ${adults === 1 ? "adult" : "adults"}`;
  if (children < 1) return `${roomLabel} · ${adultLabel}`;
  const childLabel = `${children} ${children === 1 ? "child" : "children"}`;
  return `${roomLabel} · ${adultLabel} · ${childLabel}`;
}
