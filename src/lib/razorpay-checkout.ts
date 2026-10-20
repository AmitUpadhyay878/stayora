"use client";

export type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response?: unknown) => void) => void;
};

export type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

let scriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if ((window as { Razorpay?: RazorpayConstructor }).Razorpay) return Promise.resolve(true);
  scriptPromise ??= new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export function getRazorpayConstructor() {
  if (typeof window === "undefined") return undefined;
  return (window as { Razorpay?: RazorpayConstructor }).Razorpay;
}
