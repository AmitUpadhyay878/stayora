"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, SlidersHorizontal, Sparkles, Users, X } from "lucide-react";
import { BRAND_OPTIONS, PROPERTY_SORTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type OpenKey = "brand" | "city" | "guests" | "sort" | null;

function Menu({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function handle(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className="absolute left-0 top-[calc(100%+10px)] z-30 min-w-[16rem] rounded-2xl border border-white/60 bg-white/90 p-2 shadow-[0_18px_50px_rgba(31,31,31,0.14)] backdrop-blur-xl"
    >
      {children}
    </div>
  );
}

function Option({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200",
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

export function PropertyFilters({ cities }: { cities: { name: string; slug: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") ?? "";
  const city = searchParams.get("city") ?? "";
  const guests = searchParams.get("guests") ?? "";
  const sort = searchParams.get("sort") ?? "recommended";
  const [open, setOpen] = useState<OpenKey>(null);

  const brandLabel = BRAND_OPTIONS.find((option) => option.id === brand)?.label.replace("Stayora ", "") ?? "Brand";
  const cityLabel = cities.find((option) => option.slug === city)?.name ?? "City";
  const guestsLabel = guests ? `${guests}${guests === "5" ? "+" : ""} guests` : "Guests";
  const sortLabel = PROPERTY_SORTS.find((option) => option.id === sort)?.label ?? "Recommended";
  const activeCount = [brand, city, guests, sort !== "recommended" ? sort : ""].filter(Boolean).length;

  function update(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || (key === "sort" && value === "recommended")) params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    router.push(`/hotels${qs ? `?${qs}` : ""}`);
    setOpen(null);
  }

  const cell = (key: OpenKey, filled: boolean) =>
    cn(
      "flex min-h-12 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-left transition-all duration-200",
      filled ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted",
      open === key && !filled && "bg-muted",
    );

  return (
    <div className="sticky top-20 z-20">
      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/60 bg-white/70 p-2 shadow-[0_12px_40px_rgba(31,31,31,0.08)] backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <button type="button" onClick={() => setOpen(open === "brand" ? null : "brand")} className={cell("brand", Boolean(brand))}>
            <Sparkles className="h-4 w-4 shrink-0 opacity-70" />
            <span className="min-w-0 truncate text-sm font-semibold">{brandLabel}</span>
            <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 opacity-60 transition-transform", open === "brand" && "rotate-180")} />
          </button>
          <Menu open={open === "brand"} onClose={() => setOpen(null)}>
            <Option active={!brand} onClick={() => update({ brand: undefined })}>
              All brands
            </Option>
            {BRAND_OPTIONS.map((option) => (
              <Option key={option.id} active={brand === option.id} onClick={() => update({ brand: option.id })}>
                <span className="flex w-full items-center justify-between gap-3">
                  {option.label.replace("Stayora ", "")}
                  <span className={cn("text-[11px] uppercase tracking-wide", brand === option.id ? "text-white/80" : "text-muted-foreground")}>
                    {option.tier}
                  </span>
                </span>
              </Option>
            ))}
          </Menu>
        </div>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="relative min-w-0 flex-1">
          <button type="button" onClick={() => setOpen(open === "city" ? null : "city")} className={cell("city", Boolean(city))}>
            <MapPin className="h-4 w-4 shrink-0 opacity-70" />
            <span className="min-w-0 truncate text-sm font-semibold">{cityLabel}</span>
            <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 opacity-60 transition-transform", open === "city" && "rotate-180")} />
          </button>
          <Menu open={open === "city"} onClose={() => setOpen(null)}>
            <Option active={!city} onClick={() => update({ city: undefined })}>
              All cities
            </Option>
            {cities.map((option) => (
              <Option key={option.slug} active={city === option.slug} onClick={() => update({ city: option.slug })}>
                {option.name}
              </Option>
            ))}
          </Menu>
        </div>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="relative min-w-0 flex-1">
          <button type="button" onClick={() => setOpen(open === "guests" ? null : "guests")} className={cell("guests", Boolean(guests))}>
            <Users className="h-4 w-4 shrink-0 opacity-70" />
            <span className="min-w-0 truncate text-sm font-semibold">{guestsLabel}</span>
            <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 opacity-60 transition-transform", open === "guests" && "rotate-180")} />
          </button>
          <Menu open={open === "guests"} onClose={() => setOpen(null)}>
            <Option active={!guests} onClick={() => update({ guests: undefined })}>
              Any guests
            </Option>
            {[1, 2, 3, 4, 5].map((count) => (
              <Option key={count} active={guests === String(count)} onClick={() => update({ guests: String(count) })}>
                {count}
                {count === 5 ? "+" : ""} {count === 1 ? "guest" : "guests"}
              </Option>
            ))}
          </Menu>
        </div>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="relative min-w-0 flex-1">
          <button type="button" onClick={() => setOpen(open === "sort" ? null : "sort")} className={cell("sort", sort !== "recommended")}>
            <SlidersHorizontal className="h-4 w-4 shrink-0 opacity-70" />
            <span className="min-w-0 truncate text-sm font-semibold">{sortLabel}</span>
            <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 opacity-60 transition-transform", open === "sort" && "rotate-180")} />
          </button>
          <Menu open={open === "sort"} onClose={() => setOpen(null)}>
            {PROPERTY_SORTS.map((option) => (
              <Option key={option.id} active={sort === option.id} onClick={() => update({ sort: option.id })}>
                {option.label}
              </Option>
            ))}
          </Menu>
        </div>

        {activeCount ? (
          <button
            type="button"
            onClick={() => router.push("/hotels")}
            aria-label="Clear all filters"
            className="inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground text-background transition-transform duration-200 hover:scale-105"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
