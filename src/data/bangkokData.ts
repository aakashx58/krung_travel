export interface HeroSlide {
  id: number;
  photo: string;
  position: string;
  titleLines: string[];
  titleClass: string;
  captionTitle: string;
  captionBody: string;
  thumbIndexInRail: number; // 0 = top, 1 = middle, 2 = bottom
}

export interface RailThumb {
  id: number;
  slideIndex: number;
  label: string;
  image: string;
}

export interface StayProperty {
  id: string;
  name: string;
  area: string;
  price: number;
  priceFormatted: string;
  rating: string;
  reviewsCount: number;
  photo700: string;
  photo1400: string;
  category: string;
  description: string;
}

export const CLOUD_IMAGE =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005635_6590354a-216c-40a2-9f84-93abe97dc7b1.png&w=2400&q=85";

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 0,
    photo:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005348_d02f5076-330a-4062-960b-b000a310d6e4.png&w=2400&q=85",
    position: "center 62%",
    titleLines: ["WELCOME TO BANGKOK"],
    titleClass: "hero-title-1",
    captionTitle: "Discover Bangkok",
    captionBody:
      "Discover Bangkok's best places to stay and visit. Find suitable ones for you and your family",
    thumbIndexInRail: 2, // Wat Arun (bottom)
  },
  {
    id: 1,
    photo:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005347_2a7781a6-ffd1-48f1-bb19-051b67063047.png&w=2400&q=85",
    position: "center 55%",
    titleLines: ["FIND PLACE TO STAY"],
    titleClass: "hero-title-2",
    captionTitle: "Places to stay",
    captionBody:
      "Riverside teak houses, sky-high suites and quiet garden villas picked for you",
    thumbIndexInRail: 1, // Floating market (middle)
  },
  {
    id: 2,
    photo:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005347_73725010-6ca6-46d8-a732-fc33275a02e0.png&w=2400&q=85",
    position: "center 40%",
    titleLines: ["EXPLORE", "BANGKOK"],
    titleClass: "hero-title-3",
    captionTitle: "Places to go",
    captionBody:
      "Explore through the eyes of Bangkok's best Thai adventures",
    thumbIndexInRail: 0, // Tuk-tuk (top)
  },
];

// Vertical column order: Top = tuk-tuk (slide 3), Middle = floating market (slide 2), Bottom = Wat Arun (slide 1)
export const RAIL_THUMBS: RailThumb[] = [
  {
    id: 0,
    slideIndex: 2,
    label: "Tuk-tuk in Bangkok",
    image:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005347_2697af01-b81b-4c9e-bb4f-7200cb1aa1e8.png&w=400&q=85",
  },
  {
    id: 1,
    slideIndex: 1,
    label: "Floating market",
    image:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005347_e2768ec3-714b-47bc-b03e-4fc6794d5dd9.png&w=400&q=85",
  },
  {
    id: 2,
    slideIndex: 0,
    label: "Wat Arun with a longtail boat",
    image:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005347_c5667173-fd6e-4dcb-9547-6c4518e19388.png&w=400&q=85",
  },
];

const makePhotoUrls = (filename: string) => ({
  photo700: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2F${filename}&w=700&q=85`,
  photo1400: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2F${filename}&w=1400&q=85`,
});

const DEFAULT_DESCRIPTION =
  "Tucked along the quiet canals of historic Thonburi, this sanctuary puts the Grand Palace and Wat Arun just across the water. Step onto a private longtail from the garden pier, glide past riverside shrines to Chinatown street food, and return at dusk to a lantern-lit teak terrace above the Chao Phraya.";

export const STAYS: StayProperty[] = [
  {
    id: "riverside-teak-villa",
    name: "Riverside Teak Villa",
    area: "Khlong San, Bangkok",
    price: 1300,
    priceFormatted: "$1,300",
    rating: "4,8",
    reviewsCount: 128,
    category: "Villas",
    description: DEFAULT_DESCRIPTION,
    ...makePhotoUrls("hf_20261115_005347_d7535a9a-29c3-4714-9c2a-4b8934ed1df2.png"),
  },
  {
    id: "baan-suan-teak-house",
    name: "Baan Suan Teak House",
    area: "Thonburi, Bangkok",
    price: 1200,
    priceFormatted: "$1,200",
    rating: "4,8",
    reviewsCount: 128,
    category: "Villas",
    description: DEFAULT_DESCRIPTION,
    ...makePhotoUrls("hf_20261115_005405_6867b7fa-e6ec-4c5c-a810-aea29a94cce4.png"),
  },
  {
    id: "sathorn-sky-condo",
    name: "Sathorn Sky Condo",
    area: "Sathorn, Bangkok",
    price: 170,
    priceFormatted: "$170",
    rating: "4,8",
    reviewsCount: 128,
    category: "Sky Suites",
    description: DEFAULT_DESCRIPTION,
    ...makePhotoUrls("hf_20261115_005408_78f07613-5823-4ef1-94a9-cbf8977e5c38.png"),
  },
  {
    id: "velvet-night-suite",
    name: "Velvet Night Suite",
    area: "Silom, Bangkok",
    price: 120,
    priceFormatted: "$120",
    rating: "4,8",
    reviewsCount: 128,
    category: "Suites",
    description: DEFAULT_DESCRIPTION,
    ...makePhotoUrls("hf_20261115_005408_816e6775-3733-4270-8e1f-bbf270fe3fff.png"),
  },
  {
    id: "lantern-deck-house",
    name: "Lantern Deck House",
    area: "Bang Rak, Bangkok",
    price: 70,
    priceFormatted: "$70",
    rating: "4,8",
    reviewsCount: 128,
    category: "Villas",
    description: DEFAULT_DESCRIPTION,
    ...makePhotoUrls("hf_20261115_005408_bf9bfa74-cb9c-4055-a632-b725670fdc9d.png"),
  },
  {
    id: "skyline-pool-cabana",
    name: "Skyline Pool Cabana",
    area: "Sukhumvit, Bangkok",
    price: 105,
    priceFormatted: "$105",
    rating: "4,8",
    reviewsCount: 128,
    category: "Villas",
    description: DEFAULT_DESCRIPTION,
    ...makePhotoUrls("hf_20261115_005413_84e12590-d5b2-4676-9600-c31c6cd0b0f4.png"),
  },
  {
    id: "grand-river-residence",
    name: "Grand River Residence",
    area: "Charoen Krung, Bangkok",
    price: 1300,
    priceFormatted: "$1,300",
    rating: "4,8",
    reviewsCount: 128,
    category: "Villas",
    description: DEFAULT_DESCRIPTION,
    ...makePhotoUrls("hf_20261115_005414_da006178-018e-4ed8-b340-f6a70f18f1bc.png"),
  },
  {
    id: "palm-court-resort",
    name: "Palm Court Resort",
    area: "Bang Na, Bangkok",
    price: 1200,
    priceFormatted: "$1,200",
    rating: "4,8",
    reviewsCount: 128,
    category: "Villas",
    description: DEFAULT_DESCRIPTION,
    ...makePhotoUrls("hf_20261115_005417_3c7632ad-341c-4e40-b370-db3c3aaf479e.png"),
  },
];

export const INTERIOR_THUMBS = [
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005420_531ca3bc-da2a-48a8-9506-30b46f6725a5.png&w=500&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005422_3d48e291-6d44-46fa-a18e-ab2f7c791839.png&w=500&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005426_0b8053b2-b0af-4629-85b1-5800d8f100d0.png&w=500&q=85",
];

export const AVATARS = [
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005635_2bc44540-0fec-4b94-9f47-722c00c851dd.png&w=120&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005635_fee8e948-a5dc-4e86-9ecc-dc8dbce6b660.png&w=120&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005635_ce259660-2765-42ee-a5b0-3afee70b11aa.png&w=120&q=85",
];
