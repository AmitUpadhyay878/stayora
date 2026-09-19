import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-3 text-3xl font-semibold">We could not find that page</h1>
      <p className="mt-3 text-muted-foreground">The property may have moved, or the link was mistyped.</p>
      <Link href="/hotels" className={`${buttonVariants({ size: "lg" })} mt-8`}>
        Browse our hotels
      </Link>
    </div>
  );
}
