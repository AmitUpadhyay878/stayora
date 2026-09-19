import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { privateMeta } from "@/lib/seo";

export const metadata = privateMeta("Wishlist", "/wishlist");

export default async function WishlistLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in?callbackUrl=/wishlist");
  return children;
}
