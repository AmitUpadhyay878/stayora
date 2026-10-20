import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Become a member",
  description:
    "Join Stayora as a member to save a wishlist and manage every booking in one place. Guests can still book without an account.",
  path: "/sign-up",
});

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const callbackUrl = typeof query.callbackUrl === "string" ? query.callbackUrl : "/";

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">Become a Stayora member</h1>
      <p className="mt-2 text-muted-foreground">
        Members keep a wishlist and track every deposit and booking in one place. Prefer not to sign up? Guests can
        reserve without an account.
      </p>
      <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
        <AuthForm mode="sign-up" callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
