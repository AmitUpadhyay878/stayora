"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { ROOM_EXTRAS } from "@/lib/constants";
import { cn, formatCurrency, nightsBetween } from "@/lib/utils";
import { DEPOSIT_RATE, computeBookingAmounts } from "@/lib/pricing";
import {
  getRazorpayConstructor,
  loadRazorpayScript,
  type RazorpayResponse,
} from "@/lib/razorpay-checkout";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().max(20).optional(),
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

type PaymentInfo = {
  provider: "razorpay";
  configured: boolean;
  keyId: string | null;
  orderId: string | null;
  amount: number;
  currency: string;
};

export function BookingForm({
  hotelId,
  hotelSlug,
  hotelName,
  pricePerNight,
  roomOptions = [],
  defaults,
}: {
  hotelId: string;
  hotelSlug: string;
  hotelName: string;
  pricePerNight: number;
  roomOptions?: { name: string; slug: string; priceFrom: number }[];
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
  const isMember = Boolean(session?.user);

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
      phone: "",
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
  const checkIn = useWatch({ control, name: "checkIn" });
  const checkOut = useWatch({ control, name: "checkOut" });
  const roomPreference = useWatch({ control, name: "roomPreference" });

  const nights =
    checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
      ? nightsBetween(new Date(checkIn), new Date(checkOut))
      : 0;
  const selectedRoom = roomOptions.find((room) => room.slug === roomPreference);
  const roomRate = selectedRoom?.priceFrom || pricePerNight;
  const guests = Math.max(1, (adults || 0) + (children || 0));
  const amounts = computeBookingAmounts({
    roomRate,
    nights,
    rooms: rooms || 1,
    guests,
    extras,
  });

  async function onSubmit(values: Values) {
    setLoading(true);
    let paid = false;
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, hotelId, hotelSlug }),
      });
      const text = await res.text();
      let data: { error?: string; booking?: { id?: string }; payment?: PaymentInfo } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Could not send request");
      }
      if (!res.ok) throw new Error(data.error || "Could not send request");
      if (!data.booking?.id) throw new Error("Could not send request");

      const bookingId = data.booking.id;
      const payment = data.payment;

      if (payment?.configured && payment.orderId && payment.keyId) {
        const ready = await loadRazorpayScript();
        const Razorpay = getRazorpayConstructor();
        if (ready && Razorpay) {
          const checkout = new Razorpay({
            key: payment.keyId,
            amount: payment.amount * 100,
            currency: payment.currency,
            name: "Stayora",
            description: `${hotelName} · ${Math.round(DEPOSIT_RATE * 100)}% deposit`,
            order_id: payment.orderId,
            prefill: {
              name: `${values.firstName} ${values.lastName}`.trim(),
              email: values.email,
              contact: values.phone || undefined,
            },
            notes: { reference: bookingId },
            theme: { color: "#ff385c" },
            handler: async (response: unknown) => {
              const payload = response as RazorpayResponse;
              paid = true;
              try {
                const verifyRes = await fetch("/api/payments/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ bookingId, ...payload }),
                });
                if (!verifyRes.ok) {
                  const verifyData = await verifyRes.json().catch(() => ({}));
                  throw new Error(verifyData.error || "Payment verification failed");
                }
                toast.success("Deposit paid", {
                  description: "Your booking is confirmed. The balance is payable at the hotel.",
                });
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Payment verification failed");
              } finally {
                setLoading(false);
                router.push(`/book/confirmation/${bookingId}`);
              }
            },
            modal: {
              ondismiss: async () => {
                if (paid) return;
                let settled = false;
                try {
                  const reconcileRes = await fetch("/api/payments/status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bookingId }),
                  });
                  const reconcileData = await reconcileRes.json().catch(() => ({}));
                  settled = Boolean(reconcileData.paid);
                } catch {
                  // best-effort; the booking simply stays awaiting payment
                }
                if (settled) {
                  toast.success("Deposit paid", {
                    description: "Your booking is confirmed. The balance is payable at the hotel.",
                  });
                } else {
                  toast.message("Payment not completed", {
                    description: "This booking is not confirmed. You can pay the deposit to confirm it.",
                  });
                }
                setLoading(false);
                router.push(`/book/confirmation/${bookingId}`);
              },
            },
          });
          checkout.on("payment.failed", async () => {
            try {
              await fetch("/api/payments/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId }),
              });
            } catch {
              // best-effort
            }
            toast.error("Payment failed. This booking is not confirmed.");
            setLoading(false);
            router.push(`/book/confirmation/${bookingId}`);
          });
          checkout.open();
          setLoading(false);
          return;
        }
        toast.error("Could not load the payment gateway. Please try again.");
      } else if (payment && !payment.configured) {
        toast.message("Booking saved — not confirmed", {
          description: "Online deposit is not switched on yet, so the hotel will share a payment link by email.",
        });
      }

      setLoading(false);
      router.push(`/book/confirmation/${bookingId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send request");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
        {isMember ? (
          <p className="text-muted-foreground">
            Signed in as a <span className="font-semibold text-foreground">Stayora member</span>. You still pay a{" "}
            {Math.round(DEPOSIT_RATE * 100)}% deposit now — the rest at the hotel.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Booking as a <span className="font-semibold text-foreground">guest</span> — no account needed. Pay only{" "}
            {Math.round(DEPOSIT_RATE * 100)}% now, the balance at the hotel.
          </p>
        )}
      </div>
      <Field label="First name" error={errors.firstName?.message}>
        <Input {...register("firstName")} autoComplete="given-name" />
      </Field>
      <Field label="Last name" error={errors.lastName?.message}>
        <Input {...register("lastName")} autoComplete="family-name" />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} autoComplete="email" />
      </Field>
      <Field label="Phone (optional)" error={errors.phone?.message}>
        <Input type="tel" {...register("phone")} autoComplete="tel" />
      </Field>
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
                  {room.name} · from {formatCurrency(room.priceFrom)} / night
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
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span>{extra.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatCurrency(extra.price)}
                    {extra.per === "night" ? extra.id === "breakfast" ? " / guest / night" : " / room / night" : " / stay"}
                  </span>
                </span>
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
      <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Payment summary</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <dt>
              {selectedRoom ? selectedRoom.name : "Standard rate"} · {formatCurrency(roomRate)} × {rooms || 1} room
              {(rooms || 1) === 1 ? "" : "s"} × {nights || 0} night{nights === 1 ? "" : "s"}
            </dt>
            <dd className="tabular-nums font-medium text-foreground">{formatCurrency(amounts.roomSubtotal)}</dd>
          </div>
          {amounts.extras.map((line) => (
            <div key={line.id} className="flex items-center justify-between text-muted-foreground">
              <dt>{line.label}</dt>
              <dd className="tabular-nums font-medium text-foreground">{formatCurrency(line.amount)}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-2">
            <dt className="font-medium">Stay total</dt>
            <dd className="tabular-nums font-semibold">{formatCurrency(amounts.total)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-medium">Pay now ({Math.round(DEPOSIT_RATE * 100)}% deposit)</dt>
            <dd className="tabular-nums font-semibold text-primary">{formatCurrency(amounts.deposit)}</dd>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <dt>Balance at hotel checkout</dt>
            <dd className="tabular-nums font-medium text-foreground">{formatCurrency(amounts.balance)}</dd>
          </div>
        </dl>
        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Secure deposit via Razorpay. The remaining balance is settled directly at the hotel when you check out.
        </p>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full" disabled={loading || isPending}>
          {loading ? "Processing..." : `Pay ${formatCurrency(amounts.deposit)} & book`}
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
