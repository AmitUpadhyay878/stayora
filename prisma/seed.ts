import { PrismaClient, type BrandTier } from "@prisma/client";

const prisma = new PrismaClient();

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const brandSeed: {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  tier: BrandTier;
}[] = [
  {
    name: "Stayora Eco Inn",
    slug: "eco-inn",
    tagline: "Economical stays without dropping comfort",
    description:
      "Stayora Eco Inn keeps the essentials sharp: clean rooms, reliable wifi, honest prices, and staff who remember your name. Designed for travellers who would rather spend on the journey than the pillow.",
    tier: "value",
  },
  {
    name: "Stayora Inn",
    slug: "inn",
    tagline: "Quality and affordability for leisure and business",
    description:
      "Stayora Inn sits in the comfortable middle — generous rooms, a proper breakfast, and locations close to business districts and old-city walks alike. The dependable choice for both work trips and weekends.",
    tier: "mid",
  },
  {
    name: "Stayora Plaza",
    slug: "plaza",
    tagline: "Refined design and top-tier amenities",
    description:
      "Stayora Plaza is our premium tier: considered interiors, a signature restaurant, and amenities tuned for celebrations and long stays. Every detail is chosen to feel effortless.",
    tier: "premium",
  },
  {
    name: "Stayora Resort",
    slug: "resort",
    tagline: "Scenic retreats worth the detour",
    description:
      "Stayora Resort places you where the landscape does the talking — forest edges, hill air, and coastlines. Slow mornings, open lawns, and rooms that open to the view.",
    tier: "leisure",
  },
];

type RoomSeed = {
  name: string;
  slug: string;
  summary: string;
  sizeSqFt: number;
  sleeps: number;
  bedType: string;
  view?: string;
  priceFrom?: number;
  extras?: string[];
};

const extraRoomsByBrand: Record<string, RoomSeed[]> = {
  "eco-inn": [
    {
      name: "Accessible Double",
      slug: "accessible-double",
      summary: "Step-free access, a roll-in shower, and a wider doorway for guests who need it.",
      sizeSqFt: 250,
      sleeps: 2,
      bedType: "Queen bed",
      extras: ["extra-bed", "early-check-in", "breakfast"],
    },
    {
      name: "Connecting Family Pair",
      slug: "connecting-family-pair",
      summary: "Two adjoining doubles with an inner door — ideal for three couples or a family split across rooms.",
      sizeSqFt: 440,
      sleeps: 6,
      bedType: "Two queen beds",
      extras: ["connecting-rooms", "extra-bed", "breakfast"],
    },
    {
      name: "Quiet Corner",
      slug: "quiet-corner",
      summary: "A rear-facing corner room with extra storage and a work table for longer stays.",
      sizeSqFt: 240,
      sleeps: 2,
      bedType: "Queen bed",
      extras: ["late-check-out", "breakfast"],
    },
  ],
  inn: [
    {
      name: "Compact Twin",
      slug: "compact-twin",
      summary: "Two single beds for friends or colleagues, with blackout curtains and a shared desk.",
      sizeSqFt: 240,
      sleeps: 2,
      bedType: "Twin beds",
      extras: ["extra-bed", "early-check-in"],
    },
    {
      name: "Executive King",
      slug: "executive-king",
      summary: "A king bed, lounge chair, and a larger bath for guests who want a quieter, upgraded stay.",
      sizeSqFt: 340,
      sleeps: 3,
      bedType: "King bed",
      extras: ["extra-bed", "late-check-out", "breakfast"],
    },
    {
      name: "Connecting Double Pair",
      slug: "connecting-double-pair",
      summary: "Two connecting doubles with an inner door for families or three couples travelling together.",
      sizeSqFt: 520,
      sleeps: 6,
      bedType: "Two queen beds",
      extras: ["connecting-rooms", "extra-bed", "breakfast"],
    },
  ],
  plaza: [
    {
      name: "Club Lounge Room",
      slug: "club-lounge-room",
      summary: "Premier room with lounge access, evening canapes, and a dedicated concierge desk.",
      sizeSqFt: 460,
      sleeps: 2,
      bedType: "King bed",
      extras: ["early-check-in", "late-check-out", "breakfast", "airport-transfer"],
    },
    {
      name: "Connecting Suite Pair",
      slug: "connecting-suite-pair",
      summary: "A premier room joined to a suite through a private door — our most flexible family option.",
      sizeSqFt: 900,
      sleeps: 5,
      bedType: "King + queen bed",
      extras: ["connecting-rooms", "extra-bed", "breakfast"],
    },
    {
      name: "Spa King",
      slug: "spa-king",
      summary: "A king room with a soaking tub, rain shower, and in-room spa amenities.",
      sizeSqFt: 480,
      sleeps: 3,
      bedType: "King bed",
      extras: ["extra-bed", "late-check-out", "breakfast"],
    },
  ],
  resort: [
    {
      name: "Hill View Cottage",
      slug: "hill-view-cottage",
      summary: "A cottage with a wide sit-out facing the hills, birdsong, and morning mist.",
      sizeSqFt: 500,
      sleeps: 3,
      bedType: "King bed",
      view: "Hills",
      extras: ["extra-bed", "breakfast", "early-check-in"],
    },
    {
      name: "Two-Bedroom Villa",
      slug: "two-bedroom-villa",
      summary: "Two bedrooms, a shared lounge, and a private deck — built for families and friend groups.",
      sizeSqFt: 920,
      sleeps: 6,
      bedType: "Two king beds",
      extras: ["connecting-rooms", "extra-bed", "breakfast", "late-check-out"],
    },
    {
      name: "Pool Pavilion",
      slug: "pool-pavilion",
      summary: "A pavilion with a plunge pool, outdoor shower, and daybeds for slow afternoons.",
      sizeSqFt: 640,
      sleeps: 4,
      bedType: "King + sofa bed",
      extras: ["extra-bed", "breakfast", "late-check-out"],
    },
  ],
};

function defaultExtras(index: number): string[] {
  const sets = [
    ["breakfast", "extra-bed"],
    ["breakfast", "early-check-in"],
    ["extra-bed", "connecting-rooms"],
    ["breakfast", "late-check-out"],
    ["airport-transfer", "breakfast"],
    ["extra-bed", "late-check-out"],
  ];
  return sets[index % sets.length];
}

type PropertySeed = {
  brandSlug: string;
  citySlug: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  diningName: string;
  diningBlurb: string;
  contactBlurb: string;
  pricePerNight: number;
  guests: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  featured: boolean;
  rooms: RoomSeed[];
  gallery: { id: string; alt: string }[];
  nearby: { name: string; distance: string; blurb: string }[];
};

function inferView(room: RoomSeed): string | undefined {
  const text = `${room.name} ${room.summary}`.toLowerCase();
  if (text.includes("ocean") || text.includes("sea")) return "Arabian Sea";
  if (text.includes("temple")) return "Temple";
  if (text.includes("hill") || text.includes("valley")) return "Hills";
  if (text.includes("forest") || text.includes("canopy") || text.includes("machan")) return "Forest";
  if (text.includes("garden") || text.includes("pool")) return "Garden";
  if (text.includes("golden") || text.includes("amer") || text.includes("city")) return "City";
  return undefined;
}

function withRoomCatalog(seed: PropertySeed): PropertySeed {
  const added = extraRoomsByBrand[seed.brandSlug] ?? [];
  const rooms = [...seed.rooms, ...added].map((room, index) => ({
    ...room,
    extras: room.extras ?? defaultExtras(index),
    view: room.view ?? inferView(room),
    priceFrom: room.priceFrom ?? Math.round(seed.pricePerNight * (0.88 + index * 0.1)),
  }));
  const guests = Math.max(seed.guests, ...rooms.map((room) => room.sleeps));
  return { ...seed, rooms, guests };
}

const roomPhotos = [
  "1611892440504-42a792e24d32",
  "1560448204-e02f11c3d0e2",
  "1522708323590-d24dbb6b0267",
  "1502672260266-1c1ef2d93688",
  "1484101403633-562f891dc89a",
  "1590490360182-c33d57733427",
  "1582719478250-c89cae4dc85b",
  "1631049307264-da0ec9d70304",
  "1616594039964-ae9021a400a0",
];

const galleryPool = [
  "1566073771259-6a8506099945",
  "1571896349842-33c89424de2d",
  "1520256862855-398228c41684",
  "1445019980597-93fa8acb246c",
  "1512917774080-9991f1c4c750",
  "1600585154526-990dced4db0d",
  "1600210492486-724fe5c67fb0",
  "1590490360182-c33d57733427",
  "1476514525535-07fb3b4ae5f1",
  "1507525428034-b723cf961d3e",
  "1505691723518-36a5ac3be353",
  "1537996194471-e657df975ab4",
  "1501594907352-04cda38ebc29",
  "1441974231531-c6227db76b6e",
  "1470071459604-3b5ec3a7fe05",
  "1469474968028-56623f02e42e",
];

const propertySeed: PropertySeed[] = [
  {
    brandSlug: "eco-inn",
    citySlug: "ambaji",
    name: "Stayora Eco Inn Ambaji",
    slug: "eco-inn-ambaji",
    description:
      "A short walk from the Ambaji temple complex, this Eco Inn keeps things calm and practical. Rooms are bright and simple, the courtyard is shaded, and the staff will point you to the best darshan timing. A sensible base for pilgrims and road-trippers heading into the Aravallis.",
    address: "Near Shri Arasuri Ambaji Temple, Ambaji, Gujarat 385110",
    phone: "+91 2749 220 118",
    email: "ambaji@stayora.in",
    diningName: "Annapurna Kitchen",
    diningBlurb:
      "Pure-vegetarian Gujarati thalis, poha and chai from dawn, and a light evening menu after aarti. The kitchen is satvik-friendly on request.",
    contactBlurb:
      "Our front desk is staffed around the clock for early darshan departures. Share your arrival time and we will hold a parking spot.",
    pricePerNight: 2900,
    guests: 4,
    rating: 4.6,
    reviewCount: 214,
    amenities: ["wifi", "parking", "air_conditioning", "breakfast", "pet_friendly"],
    featured: true,
    rooms: [
      {
        name: "Standard Double",
        slug: "standard-double",
        summary: "A compact double with a work table, clean linens, and a quiet rear-facing window.",
        sizeSqFt: 220,
        sleeps: 2,
        bedType: "Queen bed",
      },
      {
        name: "Deluxe Twin",
        slug: "deluxe-twin",
        summary: "Two twin beds, a cushioned reading corner, and extra space for luggage after a long drive.",
        sizeSqFt: 280,
        sleeps: 3,
        bedType: "Twin beds",
      },
      {
        name: "Family Room",
        slug: "family-room",
        summary: "A larger room for families travelling together, with a sofa bed for the youngest guest.",
        sizeSqFt: 360,
        sleeps: 4,
        bedType: "Queen + sofa bed",
      },
    ],
    gallery: [
      { id: "1566073771259-6a8506099945", alt: "Eco Inn Ambaji courtyard in morning light" },
      { id: "1571896349842-33c89424de2d", alt: "Terrace seating at Eco Inn Ambaji" },
      { id: "1611892440504-42a792e24d32", alt: "Standard Double room at Eco Inn Ambaji" },
      { id: "1560448204-e02f11c3d0e2", alt: "Deluxe Twin room at Eco Inn Ambaji" },
      { id: "1522708323590-d24dbb6b0267", alt: "Family Room at Eco Inn Ambaji" },
      { id: "1502672260266-1c1ef2d93688", alt: "Breakfast spread at Annapurna Kitchen" },
      { id: "1414235077428-338989a2e8c0", alt: "Dining tables at Annapurna Kitchen" },
      { id: "1507525428034-b723cf961d3e", alt: "Aravalli hills near Ambaji" },
    ],
    nearby: [
      { name: "Shri Arasuri Ambaji Temple", distance: "400 m", blurb: "One of Gujarat's most visited shrines, busiest at Bhadrapad Purnima." },
      { name: "Gabbar Hill", distance: "5 km", blurb: "Ropeway or 999 steps to a sunrise view over the plains." },
      { name: "Kumbhariya Jain Temples", distance: "6 km", blurb: "Intricately carved marble temples in a quiet village setting." },
      { name: "Ambaji Bazaar", distance: "300 m", blurb: "Street stalls for prasad, silver jewellery, and cold falooda." },
    ],
  },
  {
    brandSlug: "eco-inn",
    citySlug: "bangalore",
    name: "Stayora Eco Inn Jayanagar Bangalore",
    slug: "eco-inn-jayanagar-bangalore",
    description:
      "Tucked into Jayanagar's leafy fourth block, this Eco Inn is built for people who want to wake up near the good filter coffee. Metro access is a short walk, the neighbourhood is walkable and safe, and rooms are quiet enough for a working week.",
    address: "4th Block, Jayanagar, Bengaluru, Karnataka 560011",
    phone: "+91 80 4123 7788",
    email: "jayanagar@stayora.in",
    diningName: "Malleshwaram Tiffin Room",
    diningBlurb:
      "Idli, dosa, and filter coffee from 6:30 am, plus a short North Indian dinner menu. The podi is house-made and dangerously good.",
    contactBlurb:
      "Ask us for a shaded walking route to Lalbagh or a reliable auto to the airport. We keep umbrellas at the desk through the monsoon.",
    pricePerNight: 3600,
    guests: 3,
    rating: 4.5,
    reviewCount: 389,
    amenities: ["wifi", "workspace", "air_conditioning", "breakfast", "gym"],
    featured: true,
    rooms: [
      {
        name: "Smart Single",
        slug: "smart-single",
        summary: "A tidy single for solo travellers, with a full desk and blackout curtains.",
        sizeSqFt: 190,
        sleeps: 1,
        bedType: "Single bed",
      },
      {
        name: "Business Double",
        slug: "business-double",
        summary: "A double with an ergonomic chair, fast wifi, and a walk-in shower.",
        sizeSqFt: 260,
        sleeps: 2,
        bedType: "Queen bed",
      },
      {
        name: "Corner Studio",
        slug: "corner-studio",
        summary: "Street-facing windows on two sides, a kitchenette, and a small dining nook.",
        sizeSqFt: 330,
        sleeps: 2,
        bedType: "King bed",
      },
    ],
    gallery: [
      { id: "1512917774080-9991f1c4c750", alt: "Eco Inn Jayanagar facade" },
      { id: "1522708323590-d24dbb6b0267", alt: "Business Double at Eco Inn Jayanagar" },
      { id: "1484101403633-562f891dc89a", alt: "Corner Studio seating at Eco Inn Jayanagar" },
      { id: "1552566626-52f8b828add9", alt: "Filter coffee service at Malleshwaram Tiffin Room" },
      { id: "1469474968028-56623f02e42e", alt: "Jayanagar tree-lined street" },
      { id: "1441974231531-c6227db76b6e", alt: "Lalbagh garden near the hotel" },
      { id: "1502672260266-1c1ef2d93688", alt: "Breakfast counter at Eco Inn Jayanagar" },
      { id: "1600585154526-990dced4db0d", alt: "Corner Studio bed at Eco Inn Jayanagar" },
    ],
    nearby: [
      { name: "Lalbagh Botanical Garden", distance: "1.5 km", blurb: "240 acres of glasshouse, lawns, and morning walkers." },
      { name: "Jayanagar 4th Block Market", distance: "600 m", blurb: "Fruit stalls, idli carts, and the city's best people-watching." },
      { name: "Bull Temple", distance: "2.5 km", blurb: "A 16th-century Dravidian temple with a monolithic Nandi." },
      { name: "National Gallery of Modern Art", distance: "4 km", blurb: "Contemporary Indian art in a colonial-era building." },
    ],
  },
  {
    brandSlug: "eco-inn",
    citySlug: "dehradun",
    name: "Stayora Eco Inn Dehradun",
    slug: "eco-inn-dehradun",
    description:
      "On a quiet lane off Rajpur Road, this Eco Inn is a clean, warm landing for Doon Valley trips. Mussoorie is an hour uphill, the Robber's Cave is close, and the bakery at the corner is a local institution. Simple rooms, mountain air, and quick chai.",
    address: "Rajpur Road, Dehradun, Uttarakhand 248001",
    phone: "+91 135 274 5566",
    email: "dehradun@stayora.in",
    diningName: "Doon Valley Diner",
    diningBlurb:
      "Garhwali home-style meals, Maggi and chai for the hills, and a full English breakfast if you are heading out early.",
    contactBlurb:
      "We arrange shared taxis to Mussoorie and Rishikesh, and store luggage if you are trekking before your next night.",
    pricePerNight: 3100,
    guests: 4,
    rating: 4.7,
    reviewCount: 176,
    amenities: ["wifi", "parking", "breakfast", "air_conditioning", "pet_friendly"],
    featured: false,
    rooms: [
      {
        name: "Standard Double",
        slug: "standard-double",
        summary: "A cosy double with a valley-facing balcony and thick quilts in winter.",
        sizeSqFt: 230,
        sleeps: 2,
        bedType: "Queen bed",
      },
      {
        name: "Valley Twin",
        slug: "valley-twin",
        summary: "Twin beds, a writing desk by the window, and morning light over the ridge.",
        sizeSqFt: 270,
        sleeps: 3,
        bedType: "Twin beds",
      },
      {
        name: "Family Suite",
        slug: "family-suite",
        summary: "A separate sitting area and two sleeping zones for families on a hill break.",
        sizeSqFt: 400,
        sleeps: 4,
        bedType: "Queen + twin beds",
      },
    ],
    gallery: [
      { id: "1476514525535-07fb3b4ae5f1", alt: "Eco Inn Dehradun exterior in the Doon Valley" },
      { id: "1552566626-52f8b828add9", alt: "Doon Valley Diner table setting" },
      { id: "1611892440504-42a792e24d32", alt: "Standard Double at Eco Inn Dehradun" },
      { id: "1560448204-e02f11c3d0e2", alt: "Valley Twin room at Eco Inn Dehradun" },
      { id: "1590490360182-c33d57733427", alt: "Family Suite at Eco Inn Dehradun" },
      { id: "1441974231531-c6227db76b6e", alt: "Forest path above Dehradun" },
      { id: "1470071459604-3b5ec3a7fe05", alt: "Misty hills near Mussoorie" },
      { id: "1502672260266-1c1ef2d93688", alt: "Breakfast at Eco Inn Dehradun" },
    ],
    nearby: [
      { name: "Robber's Cave (Gucchupani)", distance: "8 km", blurb: "A stream that disappears into a rocky gorge — wade through in sandals." },
      { name: "Sahastradhara", distance: "14 km", blurb: "Sulphur springs and stepped pools below limestone cliffs." },
      { name: "Mindrolling Monastery", distance: "6 km", blurb: "A towering Buddha statue and serene Tibetan gardens." },
      { name: "Mussoorie Mall Road", distance: "34 km", blurb: "The classic hill-station promenade, best on a clear weekday." },
    ],
  },
  {
    brandSlug: "inn",
    citySlug: "jaipur",
    name: "Stayora Inn Jaipur",
    slug: "inn-jaipur",
    description:
      "A pink-city base with a rooftop that catches the Nahargarh sunset. Stayora Inn Jaipur blends a heritage facade with modern rooms, and the old city's gates, bazaars, and palaces are a short ride away.",
    address: "Bani Park, Jaipur, Rajasthan 302016",
    phone: "+91 141 220 3344",
    email: "jaipur@stayora.in",
    diningName: "Pink City Terrace",
    diningBlurb:
      "Rajasthani laal maas and dal baati on the rooftop, with a lighter continental menu and cold coffee through the afternoon heat.",
    contactBlurb:
      "Book a heritage walk or a block-printing workshop at the desk. We will also pack breakfast for early Amber Fort entry.",
    pricePerNight: 5200,
    guests: 4,
    rating: 4.7,
    reviewCount: 512,
    amenities: ["wifi", "pool", "breakfast", "air_conditioning", "gym", "workspace"],
    featured: true,
    rooms: [
      {
        name: "Heritage Double",
        slug: "heritage-double",
        summary: "Jharokha-style windows, block-printed textiles, and a comfortable queen bed.",
        sizeSqFt: 260,
        sleeps: 2,
        bedType: "Queen bed",
      },
      {
        name: "Terrace Room",
        slug: "terrace-room",
        summary: "Direct access to the rooftop terrace and the best sunset seat in the house.",
        sizeSqFt: 300,
        sleeps: 3,
        bedType: "King bed",
      },
      {
        name: "Courtyard Suite",
        slug: "courtyard-suite",
        summary: "A quiet suite facing the inner courtyard, with a lounge chair and rain shower.",
        sizeSqFt: 380,
        sleeps: 3,
        bedType: "King bed",
      },
    ],
    gallery: [
      { id: "1590490360182-c33d57733427", alt: "Stayora Inn Jaipur heritage facade" },
      { id: "1600585154526-990dced4db0d", alt: "Heritage Double at Stayora Inn Jaipur" },
      { id: "1582719478250-c89cae4dc85b", alt: "Terrace Room at Stayora Inn Jaipur" },
      { id: "1616594039964-ae9021a400a0", alt: "Courtyard Suite at Stayora Inn Jaipur" },
      { id: "1552566626-52f8b828add9", alt: "Rooftop dinner at Pink City Terrace" },
      { id: "1512917774080-9991f1c4c750", alt: "Poolside at Stayora Inn Jaipur" },
      { id: "1520256862855-398228c41684", alt: "Haveli courtyard detail in Jaipur" },
      { id: "1600210492486-724fe5c67fb0", alt: "Rooftop view over Jaipur" },
    ],
    nearby: [
      { name: "Hawa Mahal", distance: "3 km", blurb: "The wind palace's honeycomb windows, best photographed at dawn." },
      { name: "Amber Fort", distance: "11 km", blurb: "Hilltop ramparts, mirror halls, and a lakeside approach." },
      { name: "Jantar Mantar", distance: "3.5 km", blurb: "UNESCO astronomical instruments on a monumental scale." },
      { name: "Johari Bazaar", distance: "3 km", blurb: "Gemstones, juttis, and bandhani in the old city lanes." },
    ],
  },
  {
    brandSlug: "inn",
    citySlug: "amritsar",
    name: "Stayora Inn Amritsar",
    slug: "inn-amritsar",
    description:
      "Minutes from the Golden Temple's lanes, this Inn is built around early starts and late returns. The langar, the jallianwala memorial, and the Wagah ceremony are all easy from here, and the rooftop is a calm place to land after a full day.",
    address: "Near Golden Temple, Amritsar, Punjab 143001",
    phone: "+91 183 255 6677",
    email: "amritsar@stayora.in",
    diningName: "Amritsari Dhaba",
    diningBlurb:
      "Butter-laden kulcha, chole, and a tall glass of lassi, plus a simple continental breakfast for early departures.",
    contactBlurb:
      "We keep a shoe-cover and head-cover basket for the temple, and can arrange a Wagah border taxi with a packed snack.",
    pricePerNight: 4800,
    guests: 4,
    rating: 4.8,
    reviewCount: 623,
    amenities: ["wifi", "parking", "breakfast", "air_conditioning", "workspace"],
    featured: true,
    rooms: [
      {
        name: "Gentleman's Double",
        slug: "gentlemans-double",
        summary: "A calm double with wooden floors and a quiet lane-side window.",
        sizeSqFt: 250,
        sleeps: 2,
        bedType: "Queen bed",
      },
      {
        name: "Golden View Room",
        slug: "golden-view-room",
        summary: "A higher floor with a partial view toward the temple spires at night.",
        sizeSqFt: 300,
        sleeps: 3,
        bedType: "King bed",
      },
      {
        name: "Family Triple",
        slug: "family-triple",
        summary: "Three comfortable beds for families visiting together, with a shared seating nook.",
        sizeSqFt: 350,
        sleeps: 4,
        bedType: "Three twin beds",
      },
    ],
    gallery: [
      { id: "1520256862855-398228c41684", alt: "Stayora Inn Amritsar courtyard" },
      { id: "1616594039964-ae9021a400a0", alt: "Gentleman's Double at Stayora Inn Amritsar" },
      { id: "1582719478250-c89cae4dc85b", alt: "Golden View Room at Stayora Inn Amritsar" },
      { id: "1631049307264-da0ec9d70304", alt: "Family Triple at Stayora Inn Amritsar" },
      { id: "1414235077428-338989a2e8c0", alt: "Amritsari Dhaba seating" },
      { id: "1445019980597-93fa8acb246c", alt: "Golden Temple reflected at night" },
      { id: "1600210492486-724fe5c67fb0", alt: "Amritsar rooftops at dusk" },
      { id: "1560448204-e02f11c3d0e2", alt: "Breakfast service at Stayora Inn Amritsar" },
    ],
    nearby: [
      { name: "Golden Temple (Harmandir Sahib)", distance: "500 m", blurb: "The holiest gurdwara, open day and night, with the world's largest langar." },
      { name: "Jallianwala Bagh", distance: "700 m", blurb: "The memorial garden that marks a defining moment in India's freedom struggle." },
      { name: "Partition Museum", distance: "1.2 km", blurb: "Oral histories and belongings from the 1947 partition." },
      { name: "Wagah Border Ceremony", distance: "28 km", blurb: "The evening beating-retreat flag ceremony — arrive by 4 pm." },
    ],
  },
  {
    brandSlug: "inn",
    citySlug: "somnath",
    name: "Stayora Inn Somnath",
    slug: "inn-somnath",
    description:
      "Steps from the Somnath shore, this Inn puts the temple's evening light show and the Arabian Sea within a short walk. Rooms are cool and uncluttered, and the sea breeze on the terrace is the reason people linger.",
    address: "Somnath Temple Road, Somnath, Gujarat 362268",
    phone: "+91 2876 231 990",
    email: "somnath@stayora.in",
    diningName: "Sagar Ratna",
    diningBlurb:
      "A Gujarat-coastal vegetarian menu — thepla, undhiyu in season, and fresh coconut water — with thali service at lunch.",
    contactBlurb:
      "Our team books the temple's evening aarti timing for you and arranges Veraval transfers for onward travellers.",
    pricePerNight: 4600,
    guests: 4,
    rating: 4.6,
    reviewCount: 287,
    amenities: ["wifi", "parking", "breakfast", "air_conditioning", "ocean_view"],
    featured: false,
    rooms: [
      {
        name: "Sea Breeze Double",
        slug: "sea-breeze-double",
        summary: "A double with an eastern window that catches the morning sea breeze.",
        sizeSqFt: 250,
        sleeps: 2,
        bedType: "Queen bed",
      },
      {
        name: "Temple View Room",
        slug: "temple-view-room",
        summary: "A room facing the temple spires, best at the evening illumination.",
        sizeSqFt: 300,
        sleeps: 3,
        bedType: "King bed",
      },
      {
        name: "Ocean Family Room",
        slug: "ocean-family-room",
        summary: "A larger sea-facing room with a sofa and space for the whole family.",
        sizeSqFt: 380,
        sleeps: 4,
        bedType: "King + sofa bed",
      },
    ],
    gallery: [
      { id: "1507525428034-b723cf961d3e", alt: "Somnath coastline at sunset" },
      { id: "1566073771259-6a8506099945", alt: "Stayora Inn Somnath exterior" },
      { id: "1560448204-e02f11c3d0e2", alt: "Sea Breeze Double at Stayora Inn Somnath" },
      { id: "1590490360182-c33d57733427", alt: "Temple View Room at Stayora Inn Somnath" },
      { id: "1582719478250-c89cae4dc85b", alt: "Ocean Family Room at Stayora Inn Somnath" },
      { id: "1414235077428-338989a2e8c0", alt: "Sagar Ratna dining room" },
      { id: "1470071459604-3b5ec3a7fe05", alt: "Arabian Sea horizon near Somnath" },
      { id: "1520256862855-398228c41684", alt: "Terrace at Stayora Inn Somnath" },
    ],
    nearby: [
      { name: "Somnath Temple", distance: "300 m", blurb: "One of the twelve Jyotirlingas, with a sound-and-light show each evening." },
      { name: "Somnath Beach", distance: "200 m", blurb: "A gentle shoreline for an evening walk; swimming is not advised." },
      { name: "Prabhas Patan Museum", distance: "600 m", blurb: "Excavated remains from the temple's many rebuildings." },
      { name: "Bhalka Tirth", distance: "5 km", blurb: "A pilgrimage site set among temples and trees." },
    ],
  },
  {
    brandSlug: "plaza",
    citySlug: "jaipur",
    name: "Stayora Plaza Jaipur",
    slug: "plaza-jaipur",
    description:
      "Stayora Plaza Jaipur is our premium Rajputana address: a colonnaded lobby, a spa, and a rooftop restaurant looking toward Amer. Suites are generous, the service is quiet, and the concierge can build a day of palaces around your pace.",
    address: "Amer Road, Jaipur, Rajasthan 302002",
    phone: "+91 141 660 8080",
    email: "plaza.jaipur@stayora.in",
    diningName: "Rang Mahal",
    diningBlurb:
      "A refined Rajasthani and pan-Indian menu with a chef's tasting option, served under carved arches or on the rooftop overlooking Amer.",
    contactBlurb:
      "The concierge desk arranges private palace tours, spa bookings, and airport transfers in a sedan or SUV.",
    pricePerNight: 11800,
    guests: 4,
    rating: 4.9,
    reviewCount: 438,
    amenities: ["wifi", "pool", "gym", "breakfast", "air_conditioning", "workspace"],
    featured: true,
    rooms: [
      {
        name: "Plaza Premier",
        slug: "plaza-premier",
        summary: "A spacious premier room with a sitting area, marble bath, and city-facing windows.",
        sizeSqFt: 420,
        sleeps: 2,
        bedType: "King bed",
      },
      {
        name: "Rajputana Suite",
        slug: "rajputana-suite",
        summary: "A separate living room, hand-blocked textiles, and a deep soaking tub.",
        sizeSqFt: 620,
        sleeps: 3,
        bedType: "King bed",
      },
      {
        name: "Amer View Suite",
        slug: "amer-view-suite",
        summary: "Our top suite, with a private terrace framing the Amer hills at sunset.",
        sizeSqFt: 780,
        sleeps: 4,
        bedType: "King + sofa bed",
      },
    ],
    gallery: [
      { id: "1600585154526-990dced4db0d", alt: "Stayora Plaza Jaipur lobby" },
      { id: "1631049307264-da0ec9d70304", alt: "Plaza Premier room at Stayora Plaza Jaipur" },
      { id: "1616594039964-ae9021a400a0", alt: "Rajputana Suite at Stayora Plaza Jaipur" },
      { id: "1582719478250-c89cae4dc85b", alt: "Amer View Suite terrace at Stayora Plaza Jaipur" },
      { id: "1552566626-52f8b828add9", alt: "Rang Mahal fine dining setting" },
      { id: "1512917774080-9991f1c4c750", alt: "Pool at Stayora Plaza Jaipur" },
      { id: "1600210492486-724fe5c67fb0", alt: "Rooftop view toward Amer" },
      { id: "1445019980597-93fa8acb246c", alt: "Spa lounge at Stayora Plaza Jaipur" },
    ],
    nearby: [
      { name: "Amber Fort", distance: "6 km", blurb: "The hilltop fort-palace, with a mirror hall and evening light show." },
      { name: "Jaigarh Fort", distance: "8 km", blurb: "Home of the Jaivana cannon and long views over the Aravallis." },
      { name: "Jal Mahal", distance: "5 km", blurb: "The water palace, best seen from the Amer road at golden hour." },
      { name: "Nahargarh Fort", distance: "14 km", blurb: "Sunset views over the whole pink city from the ridge." },
    ],
  },
  {
    brandSlug: "plaza",
    citySlug: "surat",
    name: "Stayora Plaza Surat",
    slug: "plaza-surat",
    description:
      "A polished business address on the city's edge, Stayora Plaza Surat pairs a large conference floor with a rooftop pool. The textile markets and diamond district are within reach, and rooms are engineered for deep sleep between long days.",
    address: "Vesu, Surat, Gujarat 395007",
    phone: "+91 261 710 9090",
    email: "plaza.surat@stayora.in",
    diningName: "Tapi Table",
    diningBlurb:
      "A Surati-and-global menu — locho, surti undhiyu, and a strong steak frites — with a business lunch that runs on time.",
    contactBlurb:
      "We hold a meeting room with AV on request and run an efficient morning shuttle to the diamond bourse on weekdays.",
    pricePerNight: 9800,
    guests: 4,
    rating: 4.8,
    reviewCount: 356,
    amenities: ["wifi", "pool", "gym", "breakfast", "air_conditioning", "workspace", "parking"],
    featured: true,
    rooms: [
      {
        name: "Plaza Premier",
        slug: "plaza-premier",
        summary: "A bright premier room with a large desk, ergonomic chair, and rain shower.",
        sizeSqFt: 400,
        sleeps: 2,
        bedType: "King bed",
      },
      {
        name: "Executive Suite",
        slug: "executive-suite",
        summary: "A corner suite with a separate lounge, espresso machine, and skyline windows.",
        sizeSqFt: 580,
        sleeps: 3,
        bedType: "King bed",
      },
      {
        name: "Family Premier",
        slug: "family-premier",
        summary: "Two connected sleeping areas for families or colleagues sharing.",
        sizeSqFt: 660,
        sleeps: 4,
        bedType: "King + twin beds",
      },
    ],
    gallery: [
      { id: "1512917774080-9991f1c4c750", alt: "Stayora Plaza Surat exterior" },
      { id: "1600585154526-990dced4db0d", alt: "Plaza Premier at Stayora Plaza Surat" },
      { id: "1631049307264-da0ec9d70304", alt: "Executive Suite at Stayora Plaza Surat" },
      { id: "1616594039964-ae9021a400a0", alt: "Family Premier at Stayora Plaza Surat" },
      { id: "1552566626-52f8b828add9", alt: "Tapi Table restaurant" },
      { id: "1571896349842-33c89424de2d", alt: "Rooftop pool at Stayora Plaza Surat" },
      { id: "1600210492486-724fe5c67fb0", alt: "Surat skyline at dusk" },
      { id: "1445019980597-93fa8acb246c", alt: "Conference lounge at Stayora Plaza Surat" },
    ],
    nearby: [
      { name: "Surat Diamond Bourse", distance: "9 km", blurb: "The world's largest office building, in the diamond hub of Khajod." },
      { name: "Surat Castle", distance: "8 km", blurb: "A 16th-century fort on the Tapi riverfront." },
      { name: "Dumas Beach", distance: "20 km", blurb: "A black-sand beach known for its evening bhajiya stalls." },
      { name: "Dutch Garden", distance: "9 km", blurb: "A quiet colonial-era cemetery and garden in the city." },
    ],
  },
  {
    brandSlug: "plaza",
    citySlug: "ankleshwar",
    name: "Stayora Plaza Ankleshwar",
    slug: "plaza-ankleshwar",
    description:
      "Built for the industrial belt, Stayora Plaza Ankleshwar is the most comfortable night between Vadodara and Surat. Rooms are quiet and soundproofed, the kitchen starts early, and the gym is open late for shift workers.",
    address: "GIDC Estate, Ankleshwar, Gujarat 393002",
    phone: "+91 2646 220 400",
    email: "plaza.ankleshwar@stayora.in",
    diningName: "Narmada Grille",
    diningBlurb:
      "A hearty Gujarati-and-continental menu with 5 am breakfast service and a late-night snack menu for changing shifts.",
    contactBlurb:
      "Ask about our weekly corporate rates and airport-route cabs to Vadodara and Surat. Shoes are cleaned on request.",
    pricePerNight: 8600,
    guests: 3,
    rating: 4.7,
    reviewCount: 198,
    amenities: ["wifi", "gym", "breakfast", "air_conditioning", "workspace", "parking"],
    featured: false,
    rooms: [
      {
        name: "Plaza Premier",
        slug: "plaza-premier",
        summary: "A soundproofed premier room with blackout curtains for day sleepers.",
        sizeSqFt: 380,
        sleeps: 2,
        bedType: "King bed",
      },
      {
        name: "Executive Suite",
        slug: "executive-suite",
        summary: "A suite with a separate work room, a large desk, and two televisions.",
        sizeSqFt: 520,
        sleeps: 3,
        bedType: "King bed",
      },
      {
        name: "Twin Premier",
        slug: "twin-premier",
        summary: "Two king-single beds for colleagues travelling together, with privacy screens.",
        sizeSqFt: 400,
        sleeps: 3,
        bedType: "Twin beds",
      },
    ],
    gallery: [
      { id: "1571896349842-33c89424de2d", alt: "Stayora Plaza Ankleshwar exterior" },
      { id: "1616594039964-ae9021a400a0", alt: "Plaza Premier at Stayora Plaza Ankleshwar" },
      { id: "1582719478250-c89cae4dc85b", alt: "Executive Suite at Stayora Plaza Ankleshwar" },
      { id: "1631049307264-da0ec9d70304", alt: "Twin Premier at Stayora Plaza Ankleshwar" },
      { id: "1414235077428-338989a2e8c0", alt: "Narmada Grille breakfast service" },
      { id: "1445019980597-93fa8acb246c", alt: "Gym at Stayora Plaza Ankleshwar" },
      { id: "1470071459604-3b5ec3a7fe05", alt: "Narmada riverside near Ankleshwar" },
      { id: "1520256862855-398228c41684", alt: "Lobby at Stayora Plaza Ankleshwar" },
    ],
    nearby: [
      { name: "Narmada Riverfront", distance: "4 km", blurb: "A long promenade along the holy river, lively at sunset." },
      { name: "Golden Bridge", distance: "14 km", blurb: "The 1881 rail bridge between Ankleshwar and Bharuch." },
      { name: "Kadamgiri Jain Temple", distance: "20 km", blurb: "A hilltop temple complex with far views over the plains." },
      { name: "Bharuch Heritage Walk", distance: "14 km", blurb: "Old merchants' havelis and a colonial-era port quarter." },
    ],
  },
  {
    brandSlug: "resort",
    citySlug: "bhavnagar",
    name: "Stayora Resort Bhavnagar",
    slug: "resort-top3-bhavnagar",
    description:
      "A low-rise resort on the edge of Bhavnagar, wrapped in lawns and old neem trees. The resort faces away from the city noise and toward the gulf, with a pool, a spa, and enough space for children to disappear into play. A slow, green pause in Saurashtra.",
    address: "Vallabhipur Road, Bhavnagar, Gujarat 364002",
    phone: "+91 278 244 7700",
    email: "resort.bhavnagar@stayora.in",
    diningName: "Neem Court",
    diningBlurb:
      "A garden-side restaurant serving Kathiawadi thalis, wood-fired breads, and a poolside snack menu through the afternoon.",
    contactBlurb:
      "We arrange Palitana and Velavadar day trips, and the spa takes bookings from 8 am to 9 pm.",
    pricePerNight: 9200,
    guests: 5,
    rating: 4.8,
    reviewCount: 264,
    amenities: ["wifi", "pool", "gym", "breakfast", "air_conditioning", "parking"],
    featured: true,
    rooms: [
      {
        name: "Garden Cottage",
        slug: "garden-cottage",
        summary: "A standalone cottage with a private sit-out facing the lawn.",
        sizeSqFt: 440,
        sleeps: 3,
        bedType: "King bed",
      },
      {
        name: "Poolside Villa",
        slug: "poolside-villa",
        summary: "Direct pool access, a shaded deck, and an outdoor shower.",
        sizeSqFt: 600,
        sleeps: 4,
        bedType: "King + sofa bed",
      },
      {
        name: "Family Pavilion",
        slug: "family-pavilion",
        summary: "Two bedrooms sharing a veranda — the resort's most private family option.",
        sizeSqFt: 820,
        sleeps: 5,
        bedType: "Two king beds",
      },
    ],
    gallery: [
      { id: "1441974231531-c6227db76b6e", alt: "Stayora Resort Bhavnagar gardens" },
      { id: "1571896349842-33c89424de2d", alt: "Pool at Stayora Resort Bhavnagar" },
      { id: "1582719478250-c89cae4dc85b", alt: "Garden Cottage at Stayora Resort Bhavnagar" },
      { id: "1616594039964-ae9021a400a0", alt: "Poolside Villa at Stayora Resort Bhavnagar" },
      { id: "1631049307264-da0ec9d70304", alt: "Family Pavilion at Stayora Resort Bhavnagar" },
      { id: "1414235077428-338989a2e8c0", alt: "Neem Court restaurant" },
      { id: "1469474968028-56623f02e42e", alt: "Neem trees at Stayora Resort Bhavnagar" },
      { id: "1507525428034-b723cf961d3e", alt: "Gulf shoreline near Bhavnagar" },
    ],
    nearby: [
      { name: "Palitana Temples", distance: "55 km", blurb: "The Shatrunjaya hilltop holds over 800 marble temples — a full-day pilgrimage." },
      { name: "Velavadar Blackbuck National Park", distance: "45 km", blurb: "Grasslands alive with blackbuck and, in winter, harriers." },
      { name: "Takhteshwar Temple", distance: "6 km", blurb: "A hilltop Shiva temple with a wide view over Bhavnagar." },
      { name: "Gaurishankar Lake", distance: "5 km", blurb: "A pleasant boating lake ringed by a walking path." },
    ],
  },
  {
    brandSlug: "resort",
    citySlug: "shivamogga",
    name: "Stayora Sahyadri Resort Shivamogga",
    slug: "sahyadri-resort-shivamogga",
    description:
      "On the forested edge of the Sahyadris, this resort is all birdsong and coffee-scented air. Trails leave from the property, Jog Falls and Agumbe are day trips, and evenings end around a fire pit under a very dark sky.",
    address: "Kuvempu Road, Shivamogga, Karnataka 577201",
    phone: "+91 8182 277 600",
    email: "sahyadri@stayora.in",
    diningName: "Kadu Mane",
    diningBlurb:
      "Malnad home cooking — akki roti, bamboo shoot curry, and filter coffee — served in a timber-framed hall looking at the treeline.",
    contactBlurb:
      "Naturalists on our team lead morning bird walks and can arrange guided treks into the Sharavathi valley.",
    pricePerNight: 10400,
    guests: 4,
    rating: 4.9,
    reviewCount: 221,
    amenities: ["wifi", "pool", "breakfast", "air_conditioning", "parking", "pet_friendly"],
    featured: true,
    rooms: [
      {
        name: "Fern Cottage",
        slug: "fern-cottage",
        summary: "A forest-facing cottage with a veranda, mosquito nets, and a hot-water bath.",
        sizeSqFt: 450,
        sleeps: 3,
        bedType: "King bed",
      },
      {
        name: "Canopy Room",
        slug: "canopy-room",
        summary: "An upper-floor room level with the tree canopy and its morning birds.",
        sizeSqFt: 380,
        sleeps: 2,
        bedType: "Queen bed",
      },
      {
        name: "Valley Villa",
        slug: "valley-villa",
        summary: "A two-room villa with a private plunge pool and a view down the valley.",
        sizeSqFt: 760,
        sleeps: 5,
        bedType: "King + twin beds",
      },
    ],
    gallery: [
      { id: "1470071459604-3b5ec3a7fe05", alt: "Sahyadri hills near Shivamogga" },
      { id: "1441974231531-c6227db76b6e", alt: "Stayora Sahyadri Resort treeline" },
      { id: "1582719478250-c89cae4dc85b", alt: "Fern Cottage at Stayora Sahyadri Resort" },
      { id: "1631049307264-da0ec9d70304", alt: "Canopy Room at Stayora Sahyadri Resort" },
      { id: "1616594039964-ae9021a400a0", alt: "Valley Villa at Stayora Sahyadri Resort" },
      { id: "1414235077428-338989a2e8c0", alt: "Kadu Mane dining hall" },
      { id: "1469474968028-56623f02e42e", alt: "Forest trail at Stayora Sahyadri Resort" },
      { id: "1507525428034-b723cf961d3e", alt: "Sharavathi valley view" },
    ],
    nearby: [
      { name: "Jog Falls", distance: "30 km", blurb: "One of India's tallest waterfalls, thundering after the monsoon." },
      { name: "Agumbe Rainforest", distance: "55 km", blurb: "The 'Cherrapunji of the South' and a king cobra research site." },
      { name: "Sharavathi Wildlife Sanctuary", distance: "25 km", blurb: "Moist deciduous forest with lion-tailed macaques." },
      { name: "Kuppalli", distance: "18 km", blurb: "The poet Kuvempu's village home, now a quiet museum." },
    ],
  },
  {
    brandSlug: "resort",
    citySlug: "sasan-gir",
    name: "Stayora Resort Gir Forest",
    slug: "resort-gir-forest",
    description:
      "At the gateway to Gir National Park, this resort is the base for dawn safaris in search of Asiatic lions. Cottages sit among mango and jamun trees, naturalists brief guests each evening, and the silence after dark is the real luxury.",
    address: "Sasan Gir, Junagadh District, Gujarat 362135",
    phone: "+91 2877 285 500",
    email: "gir@stayora.in",
    diningName: "Sher Bagh",
    diningBlurb:
      "A rustic Kathiawadi kitchen with safari breakfasts packed in tiffins, kadhi, bajra rotla, and a bonfire dinner.",
    contactBlurb:
      "Safari permits sell out early — share your dates and we will try to secure a Gypsy and a guide for you.",
    pricePerNight: 12600,
    guests: 4,
    rating: 4.9,
    reviewCount: 342,
    amenities: ["wifi", "pool", "breakfast", "air_conditioning", "parking", "pet_friendly"],
    featured: true,
    rooms: [
      {
        name: "Forest Cottage",
        slug: "forest-cottage",
        summary: "A stone-and-timber cottage looking into the trees, with a private veranda.",
        sizeSqFt: 480,
        sleeps: 3,
        bedType: "King bed",
      },
      {
        name: "Machan Room",
        slug: "machan-room",
        summary: "An elevated room styled after a watchtower, with forest-facing windows.",
        sizeSqFt: 400,
        sleeps: 2,
        bedType: "Queen bed",
      },
      {
        name: "Lion's Den Villa",
        slug: "lions-den-villa",
        summary: "The resort's largest villa, with two bedrooms, a plunge pool, and a fire pit.",
        sizeSqFt: 850,
        sleeps: 5,
        bedType: "King + twin beds",
      },
    ],
    gallery: [
      { id: "1469474968028-56623f02e42e", alt: "Gir forest canopy" },
      { id: "1501594907352-04cda38ebc29", alt: "Stayora Resort Gir Forest grounds" },
      { id: "1582719478250-c89cae4dc85b", alt: "Forest Cottage at Stayora Resort Gir Forest" },
      { id: "1631049307264-da0ec9d70304", alt: "Machan Room at Stayora Resort Gir Forest" },
      { id: "1616594039964-ae9021a400a0", alt: "Lion's Den Villa at Stayora Resort Gir Forest" },
      { id: "1414235077428-338989a2e8c0", alt: "Sher Bagh dining at Stayora Resort Gir Forest" },
      { id: "1537996194471-e657df975ab4", alt: "Forest track in Gir" },
      { id: "1470071459604-3b5ec3a7fe05", alt: "Dry deciduous hills around Sasan Gir" },
    ],
    nearby: [
      { name: "Gir National Park", distance: "2 km", blurb: "The last home of the Asiatic lion, with dawn and dusk Gypsy safaris." },
      { name: "Devalia Safari Park", distance: "12 km", blurb: "A fenced interpretation zone for guaranteed sightings on a short drive." },
      { name: "Kamleshwar Dam", distance: "10 km", blurb: "A reservoir that draws marsh crocodiles and water birds." },
      { name: "Junagadh Uparkot Fort", distance: "50 km", blurb: "Ancient caves, stepwells, and a hilltop Buddhist complex." },
    ],
  },
];

const reviewers = [
  { author: "Maya Chen", avatar: img("1544005313-94ddf0286df2", 200), rating: 5, body: "Immaculate room and genuinely warm staff. The location made our whole trip easier." },
  { author: "Rohan Mehta", avatar: img("1500648767791-00dcc994a43e", 200), rating: 5, body: "Great value for what you get. Check-in was quick and the breakfast was better than expected." },
  { author: "Elena Rossi", avatar: img("1524504388940-b1c1722653e1", 200), rating: 4, body: "Comfortable beds and very quiet at night. I would book this property again." },
  { author: "Priya Nair", avatar: img("1548142813-c348350df52b", 200), rating: 5, body: "The staff remembered our names and helped with local tips. That made the stay." },
  { author: "Arjun Singh", avatar: img("1494790108377-be9c29b29330", 200), rating: 4, body: "Clean, well-run, and exactly as photographed. Parking was easy to find." },
  { author: "Sara Khan", avatar: img("1507003211169-0a1dd7228f2d", 200), rating: 5, body: "A lovely, calm stay. The dining recommendation was spot on and the room was spotless." },
];

const cities = [
  { name: "Ambaji", slug: "ambaji", tagline: "Temple town at the edge of the Aravallis" },
  { name: "Bangalore", slug: "bangalore", tagline: "Gardens, coffee, and a walkable old quarter" },
  { name: "Dehradun", slug: "dehradun", tagline: "Doon Valley air below the Mussoorie ridge" },
  { name: "Jaipur", slug: "jaipur", tagline: "Pink city palaces and rooftop sunsets" },
  { name: "Amritsar", slug: "amritsar", tagline: "The Golden Temple and a city that never sleeps" },
  { name: "Somnath", slug: "somnath", tagline: "Jyotirlinga shrines on the Arabian Sea" },
  { name: "Surat", slug: "surat", tagline: "Diamonds, textiles, and a busy riverfront" },
  { name: "Ankleshwar", slug: "ankleshwar", tagline: "The industrial heart of the Narmada belt" },
  { name: "Bhavnagar", slug: "bhavnagar", tagline: "Saurashtra's garden city by the gulf" },
  { name: "Shivamogga", slug: "shivamogga", tagline: "Malnad coffee country and the Sahyadri edge" },
  { name: "Sasan Gir", slug: "sasan-gir", tagline: "The last home of the Asiatic lion" },
];

const cityHeroes: Record<string, string> = {
  ambaji: "1507525428034-b723cf961d3e",
  bangalore: "1469474968028-56623f02e42e",
  dehradun: "1470071459604-3b5ec3a7fe05",
  jaipur: "1520256862855-398228c41684",
  amritsar: "1445019980597-93fa8acb246c",
  somnath: "1507525428034-b723cf961d3e",
  surat: "1600210492486-724fe5c67fb0",
  ankleshwar: "1470071459604-3b5ec3a7fe05",
  bhavnagar: "1441974231531-c6227db76b6e",
  shivamogga: "1469474968028-56623f02e42e",
  "sasan-gir": "1501594907352-04cda38ebc29",
};

function hotelImages(seed: PropertySeed) {
  const galleryIds = seed.gallery.map((g) => g.id);
  const pool = galleryPool.filter((id) => !galleryIds.includes(id));
  return [...galleryIds, ...pool].slice(0, 10).map((id) => img(id, 1600));
}

async function main() {
  await prisma.bookingRequest.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.roomCategory.deleteMany();
  await prisma.nearbyAttraction.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.city.deleteMany();
  await prisma.brand.deleteMany();

  const brandBySlug = new Map<string, string>();
  for (const brand of brandSeed) {
    const created = await prisma.brand.create({ data: brand });
    brandBySlug.set(brand.slug, created.id);
  }

  const cityBySlug = new Map<string, string>();
  for (const city of cities) {
    const created = await prisma.city.create({
      data: {
        ...city,
        country: "India",
        heroImage: img(cityHeroes[city.slug] ?? galleryPool[0], 1600),
      },
    });
    cityBySlug.set(city.slug, created.id);
  }

  let photoIndex = 0;
  for (const raw of propertySeed) {
    const seed = withRoomCatalog(raw);
    const brandId = brandBySlug.get(seed.brandSlug);
    const cityId = cityBySlug.get(seed.citySlug);
    if (!brandId || !cityId) throw new Error(`Missing brand or city for ${seed.slug}`);

    const hotel = await prisma.hotel.create({
      data: {
        name: seed.name,
        slug: seed.slug,
        brandId,
        cityId,
        description: seed.description,
        address: seed.address,
        phone: seed.phone,
        email: seed.email,
        diningName: seed.diningName,
        diningBlurb: seed.diningBlurb,
        contactBlurb: seed.contactBlurb,
        pricePerNight: seed.pricePerNight,
        guests: seed.guests,
        rating: seed.rating,
        reviewCount: seed.reviewCount,
        amenities: seed.amenities,
        images: hotelImages(seed),
        featured: seed.featured,
      },
    });

    for (let i = 0; i < seed.rooms.length; i += 1) {
      const room = seed.rooms[i];
      await prisma.roomCategory.create({
        data: {
          hotelId: hotel.id,
          name: room.name,
          slug: room.slug,
          summary: room.summary,
          sizeSqFt: room.sizeSqFt,
          sleeps: room.sleeps,
          bedType: room.bedType,
          view: room.view,
          priceFrom: room.priceFrom ?? 0,
          extras: room.extras ?? [],
          image: img(roomPhotos[(photoIndex + i) % roomPhotos.length], 1200),
          sortOrder: i,
        },
      });
    }

    for (let i = 0; i < seed.gallery.length; i += 1) {
      const image = seed.gallery[i];
      await prisma.galleryImage.create({
        data: {
          hotelId: hotel.id,
          url: img(image.id, 1600),
          alt: image.alt,
          sortOrder: i,
        },
      });
    }

    for (let i = 0; i < seed.nearby.length; i += 1) {
      const spot = seed.nearby[i];
      await prisma.nearbyAttraction.create({
        data: { hotelId: hotel.id, ...spot, sortOrder: i },
      });
    }

    const reviewCount = 2 + (photoIndex % 3);
    for (let r = 0; r < reviewCount; r += 1) {
      const review = reviewers[(photoIndex + r) % reviewers.length];
      await prisma.review.create({
        data: {
          hotelId: hotel.id,
          author: review.author,
          avatar: review.avatar,
          rating: review.rating,
          body: review.body,
        },
      });
    }

    photoIndex += 1;
  }

  const [brandTotal, cityTotal, hotelTotal, roomTotal, galleryTotal, nearbyTotal] = await Promise.all([
    prisma.brand.count(),
    prisma.city.count(),
    prisma.hotel.count(),
    prisma.roomCategory.count(),
    prisma.galleryImage.count(),
    prisma.nearbyAttraction.count(),
  ]);

  console.log(
    `Seeded ${brandTotal} brands, ${cityTotal} cities, ${hotelTotal} properties, ` +
      `${roomTotal} room categories, ${galleryTotal} gallery images, ${nearbyTotal} attractions`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
