"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Values = z.infer<typeof schema>;

export function AuthForm({
  mode,
  callbackUrl = "/",
}: {
  mode: "sign-in" | "sign-up";
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === "sign-up";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: Values) {
    if (isSignUp && !values.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          name: values.name ?? "",
          email: values.email,
          password: values.password,
          callbackURL: callbackUrl,
        });
        if (error) throw new Error(error.message || "Could not create account");
      } else {
        const { error } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: callbackUrl,
        });
        if (error) throw new Error(error.message || "Could not sign in");
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      {isSignUp ? (
        <Field label="Name" error={errors.name?.message}>
          <Input {...register("name")} autoComplete="name" />
        </Field>
      ) : null}
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} autoComplete="email" />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <Input type="password" {...register("password")} autoComplete={isSignUp ? "new-password" : "current-password"} />
      </Field>
      <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
        {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Stayora?{" "}
            <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-medium text-foreground hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
