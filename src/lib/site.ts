/**
 * Single source of truth for company / brand information.
 * All values are taken from agroskydroneaspirant.com.
 */

/**
 * Cloudinary base for the images referenced from source rather than from the
 * catalogue. Product and category art lives in MongoDB as full URLs and is
 * re-pointed by `npm run migrate:images`; these few are hard-coded, so this
 * constant is the one line to change if the account ever moves again.
 */
const CDN = "https://res.cloudinary.com/hkqj6g5s/image/upload/agrosky/images";

export const siteConfig = {
  name: "AgroSky Drone Aspirant",
  legalName: "AGROSKY DRONE ASPIRANT PRIVATE LIMITED",
  /** Default Open Graph / Twitter card image. */
  ogImage: `${CDN}/banners/1.png`,
  wordmark: "NEXTGENDRONES",
  tagline: "Next-Gen Drones for Agriculture",
  description:
    "Buy agricultural spraying drones, drone frames, flight controllers, motors, propellers and spray nozzles from AgroSky Drone Aspirant — next-generation UAV systems built for Indian farming.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agroskydroneaspirant.com",
  founder: "Chandhan Akunuri",
  founderRole: "Director & Founder",
  foundingYear: 2024,
  locale: "en_IN",
  currency: "INR",
  currencySymbol: "₹",

  contact: {
    phone: "+918340000887",
    phoneDisplay: "+91 83400 00887",
    whatsapp: "918340000887",
    email: "info@agroskydroneaspirant.com",
    address: {
      street: "Sowbhagya Nagar",
      locality: "Vuyyuru",
      region: "Andhra Pradesh",
      postalCode: "521165",
      country: "IN",
      countryName: "India",
    },
    serviceAreas: ["Andhra Pradesh", "Telangana"],
    hours: "Mon – Sat, 9:00 AM – 7:00 PM IST",
  },

  social: {
    facebook: "https://www.facebook.com/share/1Aq8SA92EU/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/agroskydroneaspirant",
    linkedin: "https://www.linkedin.com/in/chandhan-akunuri/",
    twitter: "https://twitter.com",
  },

  stats: [
    { label: "Collaborations", value: 100, suffix: "+" },
    { label: "Customers", value: 1000, suffix: "+" },
    { label: "Farmers Served", value: 1000, suffix: "+" },
    { label: "Drone Pilots Trained", value: 50, suffix: "+" },
    { label: "Workshops", value: 100, suffix: "+" },
    { label: "Drones Delivered", value: 200, suffix: "+" },
  ],
} as const;

export const services = [
  {
    slug: "crop-spraying",
    title: "Crop Spraying",
    summary:
      "Efficiently spray crops using drones for precise application of fertilizers, pesticides, or water.",
    detail:
      "Our agricultural spraying drones cover large acreage in a fraction of the time of manual spraying, cutting chemical waste and keeping operators away from exposure. Variable-rate nozzles and RTK-grade positioning keep every pass uniform.",
    image: `${CDN}/services/crop-spraying.jpg`,
    highlights: [
      "Up to 16L payload per sortie",
      "Uniform droplet coverage",
      "Reduced chemical and water waste",
    ],
  },
  {
    slug: "aerial-surveying",
    title: "Aerial Surveying",
    summary:
      "Conduct large-scale land surveys with high-resolution drone imaging.",
    detail:
      "Perfect for agriculture, construction and environmental monitoring. We deliver orthomosaics, elevation models and crop-health indices you can act on the same day.",
    image: `${CDN}/services/plane.jpg`,
    highlights: [
      "High-resolution orthomosaic maps",
      "Crop health & NDVI indices",
      "Construction progress tracking",
    ],
  },
  {
    slug: "firefighting-support",
    title: "Firefighting Support",
    summary:
      "Enhance firefighting efforts with drones that provide live aerial footage.",
    detail:
      "Thermal-equipped UAVs map fire zones in real time, locate hotspots and support rescue crews with a live overhead view — improving both safety and response time.",
    image: `${CDN}/services/fire-fighting.jpg`,
    highlights: [
      "Live aerial footage",
      "Thermal hotspot mapping",
      "Safer, faster response",
    ],
  },
  {
    slug: "drone-pilot-training",
    title: "Drone Pilot Training",
    summary:
      "Professional drone pilot training for safe and skilled operation across industries.",
    detail:
      "Structured classroom and field programmes covering airframe fundamentals, flight planning, regulations and emergency handling — built for farmers, operators and service providers.",
    image: `${CDN}/drones/arail.avif`,
    highlights: [
      "Classroom + field sessions",
      "Regulation and safety modules",
      "Certification guidance",
    ],
  },
  {
    slug: "hands-on-experience",
    title: "Hands-On Experience",
    summary:
      "Hands-on training for mastering drone operations in real-world scenarios.",
    detail:
      "Practise assembly, calibration, payload handling and field spraying on live equipment, guided by pilots who fly these machines commercially every week.",
    image: `${CDN}/drones/map.png`,
    highlights: [
      "Live equipment practice",
      "Assembly and calibration drills",
      "Real field conditions",
    ],
  },
  {
    slug: "drone-sales-support",
    title: "Drone Sales & Spares",
    summary:
      "Complete drones, frames and genuine spare parts with after-sales support.",
    detail:
      "From a single propeller to a fully assembled 16L spraying platform — we stock the parts Indian operators actually need and back them with repair and calibration support.",
    image: `${CDN}/drones/drone.png`,
    highlights: [
      "Genuine Hobbywing & EFT parts",
      "Assembly and tuning support",
      "Service across AP & Telangana",
    ],
  },
] as const;

export const courses = [
  {
    title: "Drone Basics",
    description: "Learn the core components of drones and how they are assembled.",
    image: `${CDN}/drones/arail.avif`,
  },
  {
    title: "Aerial Photography",
    description: "Master drone photography techniques, from shooting angles to editing.",
    image: `${CDN}/drones/inc.jpg`,
  },
  {
    title: "Drone Programming",
    description: "Learn to program drones for advanced autonomous operations.",
    image: `${CDN}/drones/map.png`,
  },
  {
    title: "Drone Operations",
    description: "Hone your piloting skills to handle drones in difficult conditions.",
    image: `${CDN}/drones/arail.avif`,
  },
] as const;

/** Builds a pre-filled WhatsApp deep link. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
