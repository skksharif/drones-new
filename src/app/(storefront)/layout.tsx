import { StorefrontShell } from "@/components/layout/StorefrontShell";

/**
 * The public shop. Admin routes sit outside this group so they render on the
 * bare document shell, with no header, footer, cart or tab bar.
 */
export default function StorefrontLayout({ children }: LayoutProps<"/">) {
  return <StorefrontShell>{children}</StorefrontShell>;
}
