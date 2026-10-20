import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Member sign in",
  description: "Sign in to your Stayora membership to track bookings, sync your wishlist, and pay deposits faster.",
  path: "/sign-in",
});

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const callbackUrl = typeof query.callbackUrl === "string" ? query.callbackUrl : "/";

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">Member sign in</h1>
      <p className="mt-2 text-muted-foreground">
        Members get a saved wishlist and a single place for every booking. Booking as a guest instead? You can reserve
        without an account.
      </p>
      <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
        <AuthForm mode="sign-in" callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
