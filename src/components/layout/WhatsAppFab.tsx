"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { useScrolled } from "@/hooks/useMediaQuery";
import { siteConfig, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Pages whose own bottom CTA owns this corner of the screen. */
const SUPPRESSED = ["/cart"];

/**
 * Floating WhatsApp CTA. Appears once the user scrolls past the fold so it
 * never competes with the hero call to action.
 */
export function WhatsAppFab() {
  const visible = useScrolled(420);
  const pathname = usePathname();

  if (SUPPRESSED.some((path) => pathname.startsWith(path))) return null;

  return (
    <a
      href={whatsappLink(`Hi ${siteConfig.name}, I have a question about your products.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with AgroSky on WhatsApp"
      className={cn(
        // Offset against the mobile tab bar so the two never overlap; the token
        // collapses to 0 on desktop where there is no tab bar.
        "fixed bottom-[calc(var(--bottom-nav-h)+0.75rem)] right-4 z-60 flex size-13 items-center justify-center rounded-full",
        "bg-[#25d366] text-white shadow-[0_12px_32px_-8px_rgb(37_211_102/0.6)]",
        "transition-all duration-300 ease-[var(--ease-out-soft)] motion-safe:hover:scale-110 motion-safe:active:scale-95",
        "sm:right-6 lg:bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
