import { redirect } from "next/navigation";
import { getSession, type AdminSession } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";

/**
 * Re-checks the session inside a server action.
 *
 * The protected layout already guards the pages, but a layout cannot protect
 * an action: server actions are ordinary POST endpoints that anyone can call
 * directly with the action id. Every mutation starts here.
 */
export async function requireSession(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export class AdminError extends Error {}

/**
 * Writes need somewhere to write to. Without a cluster the site runs off the
 * committed seed catalogue, which is read-only by design.
 */
export function requireDatabase(): void {
  if (!hasDatabase()) {
    throw new AdminError(
      "No database is configured, so the catalogue is read-only. Set MONGODB_URI and run `npm run seed`.",
    );
  }
}
