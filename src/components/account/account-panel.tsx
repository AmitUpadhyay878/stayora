"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function AccountPanel() {
  const router = useRouter();
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading your account...</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to manage your account.{" "}
        <Link href="/sign-in?callbackUrl=/account" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    );
  }

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="space-y-8">
      <section className="flex items-center gap-4 rounded-2xl bg-card p-6 shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {initials || "S"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Update the name shown on booking requests.</p>
        <ProfileForm name={user.name} email={user.email} onSaved={() => refetch()} />
      </section>

      <section className="rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a new password for this account.</p>
        <PasswordForm />
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/bookings" className={buttonVariants({ variant: "outline" })}>
          Your requests
        </Link>
        <Link href="/wishlist" className={buttonVariants({ variant: "outline" })}>
          Wishlist
        </Link>
        <Button type="button" variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      </section>
    </div>
  );
}

function ProfileForm({
  name,
  email,
  onSaved,
}: {
  name: string;
  email: string;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name },
  });

  async function onSubmit(values: ProfileValues) {
    setLoading(true);
    try {
      const { error } = await authClient.updateUser({ name: values.name.trim() });
      if (error) throw new Error(error.message || "Could not update profile");
      toast.success("Profile updated");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
      <Field label="Name" error={errors.name?.message}>
        <Input {...register("name")} autoComplete="name" />
      </Field>
      <Field label="Email">
        <Input value={email} disabled autoComplete="email" />
      </Field>
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit(values: PasswordValues) {
    setLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message || "Could not change password");
      toast.success("Password updated");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
      <Field label="Current password" error={errors.currentPassword?.message}>
        <Input type="password" {...register("currentPassword")} autoComplete="current-password" />
      </Field>
      <Field label="New password" error={errors.newPassword?.message}>
        <Input type="password" {...register("newPassword")} autoComplete="new-password" />
      </Field>
      <Field label="Confirm new password" error={errors.confirmPassword?.message}>
        <Input type="password" {...register("confirmPassword")} autoComplete="new-password" />
      </Field>
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Updating..." : "Update password"}
      </Button>
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
