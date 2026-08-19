import type { ReactElement, SVGProps } from "react";
import {
  BatteryIcon,
  BoardIcon,
  DroneIcon,
  FrameIcon,
  KitIcon,
  LayersIcon,
  MotorIcon,
  PlugIcon,
  PropellerIcon,
  SprayIcon,
  WrenchIcon,
} from "./Icons";

type Mark = (props: SVGProps<SVGSVGElement>) => ReactElement;

/**
 * Category slug → line icon.
 *
 * The mark lives in code rather than in the category document. `CategoryDef`
 * still carries an `icon` field, but it holds an emoji and nothing renders it
 * any more: categories are read-only, so the alternative would have been a
 * data migration just to change a picture.
 */
const BY_SLUG: Record<string, Mark> = {
  drones: DroneIcon,
  "drone-frames": FrameIcon,
  "flight-controllers": BoardIcon,
  motors: MotorIcon,
  batteries: BatteryIcon,
  chargers: PlugIcon,
  propellers: PropellerIcon,
  "controllers-kits": KitIcon,
  "spray-systems": SprayIcon,
  accessories: WrenchIcon,
};

/** Keyword fallbacks, so an unmapped slug still gets something better than the default. */
const BY_KEYWORD: [string, Mark][] = [
  ["frame", FrameIcon],
  ["controller", BoardIcon],
  ["motor", MotorIcon],
  ["batter", BatteryIcon],
  ["charg", PlugIcon],
  ["prop", PropellerIcon],
  ["kit", KitIcon],
  ["spray", SprayIcon],
  ["nozzle", SprayIcon],
  ["drone", DroneIcon],
];

export function CategoryIcon({ slug, ...props }: { slug: string } & SVGProps<SVGSVGElement>) {
  const mark = BY_SLUG[slug] ?? BY_KEYWORD.find(([key]) => slug.includes(key))?.[1] ?? LayersIcon;
  // Invoked rather than rendered as `<Mark />`: every entry above is a plain
  // SVG function with no state or hooks, and rendering a looked-up component
  // would remount it whenever the slug changed.
  return mark(props);
}
