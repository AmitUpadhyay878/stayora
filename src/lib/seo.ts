import type { Metadata } from "next";

export const SITE_NAME = "Stayora";
export const SITE_TAGLINE = "Four brands. Twelve addresses.";
export const SITE_DESCRIPTION =
  "Stayora is a family of four hotel brands across India — Eco Inn, Inn, Plaza, and Resort. Browse twelve properties, compare rooms, and book as a guest with a 20% deposit. The balance is settled at the hotel on checkout.";
export const SITE_KEYWORDS = [
  "Stayora",
  "Stayora hotels",
  "Stayora Eco Inn",
  "Stayora Inn",
  "Stayora Plaza",
  "Stayora Resort",
  "hotels in India",
  "book hotel India",
  "Ambaji hotel",
  "Jaipur hotel",
  "Amritsar hotel",
  "Gir forest resort",
];
export const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80";

export function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const origin = siteUrl();
  if (!path || path === "/") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  keywords?: string[];
};

export function pageMeta({
  title,
  description,
  path,
  index = true,
  keywords,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title;
  return {
    title: fullTitle,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function privateMeta(title: string, path?: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true },
    },
    alternates: path ? { canonical: absoluteUrl(path) } : { canonical: undefined },
  };
}

export function organizationJsonLd() {
  const origin = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "HotelChain",
    "@id": `${origin}/#organization`,
    name: SITE_NAME,
    legalName: "Stayora Group",
    url: origin,
    description: SITE_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    logo: DEFAULT_OG_IMAGE,
    telephone: "+91 7948 220 100",
    email: "stay@stayora.in",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    areaServed: { "@type": "Country", name: "India" },
    brand: [
      { "@type": "Brand", name: "Stayora Eco Inn" },
      { "@type": "Brand", name: "Stayora Inn" },
      { "@type": "Brand", name: "Stayora Plaza" },
      { "@type": "Brand", name: "Stayora Resort" },
    ],
    sameAs: [],
  };
}

export function websiteJsonLd() {
  const origin = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: SITE_NAME,
    url: origin,
    description: SITE_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: { "@id": `${origin}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${origin}/hotels?city={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

type HotelSeo = {
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  images: string[];
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  guests: number;
  brand: { name: string };
  city: { name: string; slug: string };
};

export function hotelJsonLd(hotel: HotelSeo) {
  const url = absoluteUrl(`/${hotel.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    url,
    description: hotel.description,
    image: hotel.images,
    telephone: hotel.phone,
    email: hotel.email,
    brand: { "@type": "Brand", name: hotel.brand.name },
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address,
      addressLocality: hotel.city.name,
      addressCountry: "IN",
    },
    starRating: {
      "@type": "Rating",
      ratingValue: hotel.rating,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: hotel.rating,
      reviewCount: hotel.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    priceRange: `INR ${hotel.pricePerNight}+`,
    amenityFeature: [],
    potentialAction: {
      "@type": "ReserveAction",
      target: absoluteUrl(`/book/${hotel.slug}`),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function hotelPageMeta(
  hotel: {
    name: string;
    slug: string;
    description: string;
    images: string[];
    brand: { name: string };
    city: { name: string };
  } | null,
  options: { suffix?: string; description?: string; path?: string; pathSuffix?: string; index?: boolean } = {},
): Metadata {
  if (!hotel) {
    return pageMeta({
      title: "Hotel not found",
      description: "This Stayora property could not be found.",
      path: "/hotels",
      index: false,
    });
  }
  const path = options.path ?? `/${hotel.slug}${options.pathSuffix ?? ""}`;
  const title = options.suffix ? `${options.suffix} · ${hotel.name}` : `${hotel.name}, ${hotel.city.name}`;
  const description =
    options.description ??
    `${hotel.name} is a ${hotel.brand.name} in ${hotel.city.name}. ${hotel.description.slice(0, 140)}`;
  return pageMeta({
    title,
    description,
    path,
    index: options.index ?? true,
  });
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
