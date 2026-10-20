import { z } from "zod";

export const directoryParamsSchema = z.object({
  brand: z
    .enum(["eco-inn", "inn", "plaza", "resort"])
    .optional()
    .catch(undefined),
  city: z.string().min(1).optional().catch(undefined),
  guests: z.coerce.number().int().min(1).max(16).optional().catch(undefined),
  sort: z
    .enum(["recommended", "price_asc", "price_desc", "rating_desc"])
    .optional()
    .default("recommended")
    .catch("recommended"),
});

export const bookingSchema = z
  .object({
    hotelSlug: z.string().min(1).optional(),
    hotelId: z.string().min(1).optional(),
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
  .refine((data) => data.hotelId || data.hotelSlug, {
    message: "Property is required",
    path: ["hotelId"],
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  })
  .refine((data) => data.adults + data.children >= 1, {
    message: "Add at least one guest",
    path: ["adults"],
  });

export const wishlistSchema = z.object({
  hotelId: z.string().min(1),
});

export const bookingLookupSchema = z.object({
  reference: z.string().min(4, "Enter your booking reference"),
  email: z.string().email("Enter the email used for the booking"),
});

export const paymentVerifySchema = z.object({
  bookingId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const authFormSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type DirectoryParamsInput = z.infer<typeof directoryParamsSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
