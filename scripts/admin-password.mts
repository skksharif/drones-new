/**
 * Generates the admin credentials for `.env.local` (and for the Vercel project
 * settings).
 *
 *   npm run admin:password                    prompt, then print the lines
 *   npm run admin:password -- "my password"   take the password as an argument
 *   npm run admin:password -- --write         write straight into .env.local
 *
 * The password itself is never stored — only the salted scrypt hash, which
 * cannot be reversed or replayed. `--write` keeps the session secret out of
 * your terminal scrollback entirely.
 */

import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { hashPassword } from "../src/lib/password.ts";

/** Short enough to be memorable is your call; below this it is not a password. */
const MIN_LENGTH = 3;
const COMFORTABLE_LENGTH = 12;

const ENV_FILE = new URL("../.env.local", import.meta.url);

const args = process.argv.slice(2);
const write = args.includes("--write");

async function ask(): Promise<string> {
  const fromArgs = args.filter((arg) => !arg.startsWith("--")).join(" ").trim();
  if (fromArgs) return fromArgs;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question("Choose an admin password: ")).trim();
  } finally {
    rl.close();
  }
}

/** Replaces a key in place if present, appends it otherwise. */
function setKey(contents: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(contents)) return contents.replace(pattern, line);
  return contents.replace(/\n*$/, "\n") + line + "\n";
}

const password = await ask();

if (password.length < MIN_LENGTH) {
  console.error(`\nPassword must be at least ${MIN_LENGTH} characters. Nothing was generated.`);
  process.exit(1);
}

const hash = hashPassword(password);
const secret = randomBytes(32).toString("base64url");

if (password.length < COMFORTABLE_LENGTH) {
  console.warn(
    `\nNote: ${password.length} characters is short for a password on a public site.\n` +
      "The hash is still salted scrypt, and logins are throttled, but a short\n" +
      "password is guessable. Worth lengthening once you are past setup.",
  );
}

if (write) {
  if (!existsSync(ENV_FILE)) {
    console.error("\n.env.local does not exist. Copy .env.example to .env.local first.");
    process.exit(1);
  }

  let contents = readFileSync(ENV_FILE, "utf8");
  contents = setKey(contents, "ADMIN_PASSWORD_HASH", hash);
  contents = setKey(contents, "ADMIN_SESSION_SECRET", secret);
  writeFileSync(ENV_FILE, contents);

  console.log(
    "\nWrote ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET to .env.local.\n" +
      "Copy the same two values into the Vercel project settings, then restart\n" +
      "the dev server. Changing ADMIN_SESSION_SECRET signs everyone out.",
  );
} else {
  console.log(`
Add these to .env.local, and to the Vercel project's environment variables.
Keep them out of git — .env.local is already ignored.

ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=${hash}
ADMIN_SESSION_SECRET=${secret}

The hash is not the password: it cannot be reversed, and pasting it into the
login form will not work. Changing ADMIN_SESSION_SECRET signs everyone out.
`);
}
