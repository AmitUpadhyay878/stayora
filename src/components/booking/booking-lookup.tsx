"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  reference: z.string().min(4, "Enter your booking reference"),
  email: z.string().email("Enter the email used for the booking"),
});

type Values = z.infer<typeof schema>;

export function BookingLookup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No booking found for those details");
      router.push(`/book/confirmation/${data.booking.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not find the booking");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div>
        <Label className="mb-2 block">Booking reference</Label>
        <Input {...register("reference")} placeholder="STY-XXXXXX" autoComplete="off" />
        {errors.reference ? (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.reference.message}
          </p>
        ) : null}
      </div>
      <div>
        <Label className="mb-2 block">Email</Label>
        <Input type="email" {...register("email")} autoComplete="email" />
        {errors.email ? (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>
      <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
        {loading ? "Looking up..." : "Find my booking"}
      </Button>
    </form>
  );
}
