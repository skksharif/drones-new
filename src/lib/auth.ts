import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { verifyPassword } from "./password";

/**
 * Admin authentication.
 *
 * Server-only — it reads secrets from the environment and uses `node:crypto`,
 * so importing it from a client component fails the build rather than leaking
 * anything. No credential is ever written into source or sent to the browser:
 *
 *   ADMIN_USERNAME         optional, defaults to "admin"
 *   ADMIN_PASSWORD_HASH    produced by `npm run admin:password`, never the password
 *   ADMIN_SESSION_SECRET   random 32+ byte string, signs the session cookie
 *
 * The password is stored as a salted scrypt hash, so the environment variable
 * is useless to anyone who reads it: it cannot be replayed as a login and
 * cannot be reversed into the password.
 */

export const SESSION_COOKIE = "agrosky_admin";

/** Eight hours: long enough for an editing session, short enough to expire. */
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export interface AdminSession {
  username: string;
  /** Expiry as epoch seconds. */
  expires: number;
}

/* -------------------------------------------------------------------------- */
/* Session tokens                                                             */
/* -------------------------------------------------------------------------- */

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short. Generate one with `npm run admin:password`.",
    );
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function createToken(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return payload + "." + sign(payload);
}

/** Returns the session a token carries, or `null` if it is forged or expired. */
export function readToken(token: string | undefined): AdminSession | null {
  if (!token) return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const provided = Buffer.from(token.slice(dot + 1), "base64url");
  const expected = Buffer.from(sign(payload), "base64url");
  // `timingSafeEqual` throws on a length mismatch, so screen that out first.
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  let session: AdminSession;
  try {
    session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof session?.username !== "string" || typeof session?.expires !== "number") {
    return null;
  }
  if (session.expires * 1000 <= Date.now()) return null;

  return session;
}

/* -------------------------------------------------------------------------- */
/* Credentials and configuration                                              */
/* -------------------------------------------------------------------------- */

export function adminUsername(): string {
  return process.env.ADMIN_USERNAME ?? "admin";
}

/** False when the environment has not been configured; the login page says so. */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET);
}

/**
 * Checks a submitted username and password.
 *
 * Both comparisons run whatever the outcome, so a wrong username costs the
 * same time as a wrong password and cannot be told apart from outside.
 */
export function verifyCredentials(username: string, password: string): boolean {
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHash) return false;

  const expectedUser = Buffer.from(adminUsername());
  const givenUser = Buffer.from(username);
  const userOk =
    expectedUser.length === givenUser.length && timingSafeEqual(givenUser, expectedUser);

  const passwordOk = verifyPassword(password, storedHash);
  return userOk && passwordOk;
}

/* -------------------------------------------------------------------------- */
/* Cookie helpers — Server Actions and Route Handlers only                    */
/* -------------------------------------------------------------------------- */

export async function startSession(username: string): Promise<void> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken({ username, expires }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * The authorization boundary. Every admin page and every admin server action
 * calls this — the proxy redirect is only a convenience and is never trusted.
 */
export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return readToken(store.get(SESSION_COOKIE)?.value);
}

/* -------------------------------------------------------------------------- */
/* Login throttling                                                           */
/* -------------------------------------------------------------------------- */

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * Per-process attempt counter. On serverless this only covers one instance,
 * so it is a speed bump rather than a wall — the real defence is that the
 * password is never stored anywhere it could be read back, and the hash is
 * salted scrypt.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function tooManyAttempts(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= Date.now()) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
