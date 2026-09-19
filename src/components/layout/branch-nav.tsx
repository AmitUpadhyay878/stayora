"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BranchNav({ slug, name }: { slug: string; name: string }) {
  const pathname = usePathname();
  const base = `/${slug}`;
  const items = [
    { href: base, label: "Home", exact: true },
    { href: `${base}/rooms`, label: "Rooms" },
    { href: `${base}/gallery`, label: "Gallery" },
    { href: `${base}/dining`, label: "Dining" },
    { href: `${base}/nearby-attractions`, label: "Nearby" },
    { href: `${base}/contact-us`, label: "Contact" },
  ];

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-3" aria-label={`${name} sections`}>
          {items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={`/book/${slug}`}
            className="ml-auto whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-[#e31c5f]"
          >
            Book
          </Link>
        </nav>
      </div>
    </div>
  );
}
