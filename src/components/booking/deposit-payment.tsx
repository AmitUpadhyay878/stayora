"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  getRazorpayConstructor,
  loadRazorpayScript,
  type RazorpayResponse,
} from "@/lib/razorpay-checkout";

export function DepositPayment({
  bookingId,
  hotelName,
  amount,
  prefill,
  label,
}: {
  bookingId: string;
  hotelName: string;
  amount: number;
  prefill: { name: string; email: string; contact?: string };
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function reconcile(): Promise<boolean> {
    try {
      const res = await fetch("/api/payments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json().catch(() => ({}));
      return Boolean(data.paid);
    } catch {
      // best-effort; the booking simply stays awaiting payment
      return false;
    }
  }

  async function pay() {
    setLoading(true);
    let paid = false;
    try {
      const res = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not start the payment");

      const payment = data.payment as {
        keyId: string;
        orderId: string;
        amount: number;
        currency: string;
      };

      const ready = await loadRazorpayScript();
      const Razorpay = getRazorpayConstructor();
      if (!ready || !Razorpay) throw new Error("Could not load the payment gateway");

      const checkout = new Razorpay({
        key: payment.keyId,
        amount: payment.amount * 100,
        currency: payment.currency,
        name: "Stayora",
        description: `${hotelName} · 20% deposit`,
        order_id: payment.orderId,
        prefill,
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
            toast.success("Deposit paid");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment verification failed");
          } finally {
            setLoading(false);
            router.refresh();
          }
        },
        modal: {
          ondismiss: async () => {
            if (paid) return;
            const settled = await reconcile();
            if (settled) {
              toast.success("Deposit paid");
            } else {
              toast.message("Payment not completed", {
                description: "This booking is not confirmed until the deposit is paid.",
              });
            }
            setLoading(false);
            router.refresh();
          },
        },
      });
      checkout.on("payment.failed", async () => {
        await reconcile();
        toast.error("Payment failed. This booking is not confirmed.");
        setLoading(false);
        router.refresh();
      });
      checkout.open();
      setLoading(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the payment");
      setLoading(false);
    }
  }

  return (
    <Button type="button" size="lg" onClick={pay} disabled={loading}>
      {loading ? "Processing payment..." : label ?? `Pay ${formatCurrency(amount)} deposit`}
    </Button>
  );
}
