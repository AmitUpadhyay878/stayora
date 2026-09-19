"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        duration: 4000,
        className: "font-sans",
      }}
    />
  );
}
