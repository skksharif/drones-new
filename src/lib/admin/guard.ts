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
 * MongoDB. Reads already fail without it, so this is a belt-and-braces guard
 * on the write path.
 */
export function requireDatabase(): void {
  if (!hasDatabase()) {
    throw new AdminError(
      "No database is configured. Set MONGODB_URI to edit the catalogue.",
    );
  }
}
