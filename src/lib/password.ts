import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Salted scrypt password hashing.
 *
 * Split out of `auth.ts` so `scripts/admin-password.mts` can import it under
 * plain Node: everything here is `node:crypto` only, with no Next.js imports.
 */

const SCRYPT = { N: 16_384, r: 8, p: 1, keylen: 64 } as const;

/**
 * Hashes a password into the string stored in `ADMIN_PASSWORD_HASH`.
 *
 * The parameters travel with the hash so they can be raised later without
 * invalidating an existing credential.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("hex"), key.toString("hex")].join(
    ":",
  );
}

/** Constant-time check of a password against a stored hash. */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, saltHex, keyHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  if (salt.length === 0 || expected.length === 0) return false;

  let actual: Buffer;
  try {
    actual = scryptSync(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
  } catch {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
