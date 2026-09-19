import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Create account",
  description: "Create a Stayora account to save a wishlist and request stays across twelve hotels in India.",
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
      <h1 className="text-3xl font-semibold">Create your Stayora account</h1>
      <p className="mt-2 text-muted-foreground">Save a wishlist and request stays across ten cities.</p>
      <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
        <AuthForm mode="sign-up" callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
