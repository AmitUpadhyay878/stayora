"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { ROOM_EXTRAS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    checkIn: z.string().min(1, "Check-in is required"),
    checkOut: z.string().min(1, "Check-out is required"),
    rooms: z.coerce.number().int().min(1).max(8),
    adults: z.coerce.number().int().min(1).max(16),
    children: z.coerce.number().int().min(0).max(8),
    roomPreference: z.string().max(80).optional(),
    extras: z.array(z.string()).max(8).optional(),
    message: z.string().max(800).optional(),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

type Values = z.infer<typeof schema>;

export function BookingForm({
  hotelId,
  hotelSlug,
  roomOptions = [],
  defaults,
}: {
  hotelId: string;
  hotelSlug: string;
  roomOptions?: { name: string; slug: string }[];
  defaults: {
    checkIn?: string;
    checkOut?: string;
    rooms?: number;
    adults?: number;
    children?: number;
    guests?: number;
    roomPreference?: string;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const fallbackAdults = Math.max(1, defaults.adults ?? defaults.guests ?? 2);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: session?.user.name?.split(" ")[0] ?? "",
      lastName: session?.user.name?.split(" ").slice(1).join(" ") ?? "",
      email: session?.user.email ?? "",
      checkIn: defaults.checkIn ?? "",
      checkOut: defaults.checkOut ?? "",
      rooms: defaults.rooms ?? 1,
      adults: fallbackAdults,
      children: defaults.children ?? 0,
      roomPreference: defaults.roomPreference ?? "",
      extras: [],
    },
  });

  const rooms = useWatch({ control, name: "rooms" });
  const adults = useWatch({ control, name: "adults" });
  const children = useWatch({ control, name: "children" });
  const extras = useWatch({ control, name: "extras" }) ?? [];

  async function onSubmit(values: Values) {
    if (!session?.user) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/book/${hotelSlug}`)}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, hotelId, hotelSlug }),
      });
      const text = await res.text();
      let data: { error?: string; booking?: { id?: string } } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Could not send request");
      }
      if (!res.ok) throw new Error(data.error || "Could not send request");
      if (!data.booking?.id) throw new Error("Could not send request");
      router.push(`/book/confirmation/${data.booking.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send request");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
      <Field label="First name" error={errors.firstName?.message}>
        <Input {...register("firstName")} autoComplete="given-name" />
      </Field>
      <Field label="Last name" error={errors.lastName?.message}>
        <Input {...register("lastName")} autoComplete="family-name" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} autoComplete="email" />
        </Field>
      </div>
      <Field label="Check in" error={errors.checkIn?.message}>
        <Input type="date" {...register("checkIn")} />
      </Field>
      <Field label="Check out" error={errors.checkOut?.message}>
        <Input type="date" {...register("checkOut")} />
      </Field>
      <div className="sm:col-span-2">
        <Label className="mb-3 block">Who is staying</Label>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
          <Stepper
            label="Rooms"
            hint="Separate rooms for couples or families"
            value={rooms}
            min={1}
            max={8}
            onChange={(next) => setValue("rooms", next, { shouldValidate: true })}
          />
          <Stepper
            label="Adults"
            hint="Ages 13+"
            value={adults}
            min={1}
            max={16}
            onChange={(next) => setValue("adults", next, { shouldValidate: true })}
          />
          <Stepper
            label="Children"
            hint="Ages 2–12"
            value={children}
            min={0}
            max={8}
            onChange={(next) => setValue("children", next, { shouldValidate: true })}
          />
        </div>
        {(errors.rooms || errors.adults || errors.children) && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {errors.rooms?.message || errors.adults?.message || errors.children?.message}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Example: 3 rooms and 6 adults for three couples, or 1 room with 2 adults and 1 child.
        </p>
      </div>
      {roomOptions.length ? (
        <div className="sm:col-span-2">
          <Field label="Preferred room" error={errors.roomPreference?.message}>
            <select
              {...register("roomPreference")}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="">Any available room</option>
              {roomOptions.map((room) => (
                <option key={room.slug} value={room.slug}>
                  {room.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}
      <div className="sm:col-span-2">
        <Label className="mb-3 block">Stay options</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROOM_EXTRAS.map((extra) => {
            const checked = extras.includes(extra.id);
            return (
              <label
                key={extra.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm",
                  checked ? "border-primary bg-primary/5" : "border-border bg-background",
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? extras.filter((id) => id !== extra.id) : [...extras, extra.id];
                    setValue("extras", next, { shouldValidate: true });
                  }}
                />
                {extra.label}
              </label>
            );
          })}
        </div>
      </div>
      <div className="sm:col-span-2">
        <Field label="Special requests (optional)">
          <Textarea {...register("message")} placeholder="Connecting rooms, extra bed, early check-in..." />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full" disabled={loading || isPending}>
          {loading ? "Sending request..." : "Send booking request"}
        </Button>
      </div>
    </form>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors",
            value <= min ? "cursor-not-allowed opacity-40" : "hover:border-primary hover:text-primary",
          )}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors",
            value >= max ? "cursor-not-allowed opacity-40" : "hover:border-primary hover:text-primary",
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
