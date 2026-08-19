"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearAttempts,
  endSession,
  isAuthConfigured,
  recordFailedAttempt,
  startSession,
  tooManyAttempts,
  verifyCredentials,
} from "@/lib/auth";

export interface LoginState {
  error?: string;
}

/** Best-effort client identity for throttling. Spoofable; used only to slow bots. */
async function clientKey(): Promise<string> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
}

/**
 * Only ever redirects within the admin panel, so a crafted `next` cannot bounce
 * someone to another origin.
 */
function safeNext(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/admin") && !path.startsWith("//") ? path : "/admin";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return {
      error: "Admin access is not configured on this deployment. Run `npm run admin:password`.",
    };
  }

  const key = await clientKey();
  if (tooManyAttempts(key)) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!verifyCredentials(username, password)) {
    recordFailedAttempt(key);
    // One message for both fields: naming which half was wrong would confirm a
    // valid username to someone guessing.
    return { error: "Incorrect username or password." };
  }

  clearAttempts(key);
  await startSession(username);

  // Outside the checks above on purpose — `redirect` works by throwing.
  redirect(safeNext(formData.get("next")));
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
