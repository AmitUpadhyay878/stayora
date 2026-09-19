import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { privateMeta } from "@/lib/seo";

export const metadata = privateMeta("Account", "/account");

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in?callbackUrl=/account");
  return children;
}
