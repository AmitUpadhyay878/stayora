"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useWishlist, useWishlistToggle } from "@/hooks/use-api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function WishlistButton({
  hotelId,
  name,
  className,
  showLabel = false,
}: {
  hotelId: string;
  name: string;
  className?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const wishlist = useWishlist();
  const toggle = useWishlistToggle();
  const saved = Boolean(wishlist.data?.items.some((item) => item.hotelId === hotelId));

  function onClick() {
    if (isPending) return;
    if (!session?.user) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    toggle.mutate({ hotelId, saved });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name}`}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/90 px-4 py-3 text-sm font-medium text-foreground shadow-sm",
        className,
      )}
    >
      <Heart className={cn("h-5 w-5", saved && "fill-primary text-primary")} />
      {showLabel ? (saved ? "Saved" : "Save") : null}
    </button>
  );
}
