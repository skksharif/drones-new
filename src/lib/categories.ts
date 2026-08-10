import type { CategoryDef } from "./types";

export const categories: CategoryDef[] = [
  {
    slug: "drones",
    name: "Drones",
    description:
      "Complete, ready-to-fly UAV platforms for spraying, surveillance, firefighting and personal air mobility.",
    group: "drone",
    image: "/images/services/crop-spraying.jpg",
    types: ["Spraying Drone", "Surveillance Drone", "Firefighting Drone", "Human-Flying Drone"],
  },
  {
    slug: "drone-frames",
    name: "Drone Frames",
    description:
      "EFT and S-series airframes engineered for agricultural payloads, quick assembly and long service life.",
    group: "part",
    image: "/images/products/p1.jpg",
    types: ["Agricultural Frame", "Multirotor Frame"],
  },
  {
    slug: "motors",
    name: "Motors",
    description:
      "Hobbywing brushless power systems and motor-and-propeller combo kits for heavy-lift multirotors.",
    group: "part",
    image: "/images/products/p14.jpg",
    types: ["Brushless Motor", "Motor + Propeller Combo"],
  },
  {
    slug: "propellers",
    name: "Propellers",
    description:
      "Balanced carbon and composite folding propellers sized for 24-inch and 30-inch heavy-lift setups.",
    group: "part",
    image: "/images/products/p6.jpg",
    types: ["Folding Propeller", "Propeller with Hub"],
  },
  {
    slug: "flight-controllers",
    name: "Flight Controllers",
    description:
      "Pixhawk, Cube and NAZA autopilots — the brain behind stable, repeatable autonomous missions.",
    group: "part",
    image: "/images/products/p10.jpg",
    types: ["Autopilot", "Autopilot + GPS Combo"],
  },
  {
    slug: "controllers-kits",
    name: "Controllers & Kits",
    description:
      "Complete agricultural flight-control kits with radio, GPS and spraying logic pre-integrated.",
    group: "part",
    image: "/images/products/p12.jpg",
    types: ["Flight Control Kit"],
  },
  {
    slug: "spray-systems",
    name: "Spray Systems & Nozzles",
    description:
      "Extended, Y-type and centrifugal nozzles that decide how evenly your chemical actually lands.",
    group: "part",
    image: "/images/products/p18.jpg",
    types: ["Pressure Nozzle", "Centrifugal Nozzle"],
  },
  {
    slug: "accessories",
    name: "Accessories",
    description:
      "Landing gear, mounts and hardware that keep your airframe serviceable season after season.",
    group: "part",
    image: "/images/products/p4.jpg",
    types: ["Landing Gear", "Hardware"],
  },
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

export function getCategory(slug: string): CategoryDef | undefined {
  return categoryBySlug.get(slug);
}

export function categoryName(slug: string): string {
  return categoryBySlug.get(slug)?.name ?? slug;
}
