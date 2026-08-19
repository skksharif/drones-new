import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getSession, isAuthConfigured } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Sign in",
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  // Already signed in — no reason to show the form again.
  if (await getSession()) redirect("/admin");

  const { next } = await searchParams;
  const target = typeof next === "string" ? next : "/admin";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-14">
      <div className="w-full max-w-sm">
        <Link href="/" className="mx-auto mb-7 block w-fit">
          <Image
            src="/images/brand/logo.png"
            alt={siteConfig.name}
            width={1280}
            height={853}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
          <h1 className="text-xl font-bold text-ink-900">Admin sign in</h1>
          <p className="mt-1.5 mb-6 text-sm text-ink-500">
            Catalogue management for {siteConfig.name}. Staff only.
          </p>

          {isAuthConfigured() ? null : (
            <p className="mb-5 rounded-xl border border-gold-500/30 bg-gold-400/10 px-3.5 py-2.5 text-sm text-ink-700">
              Admin access has not been configured on this deployment yet. Run{" "}
              <code className="font-mono text-xs">npm run admin:password</code> and set the printed
              variables.
            </p>
          )}

          <LoginForm next={target} />
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          <Link href="/" className="transition-colors hover:text-ink-600">
            ← Back to the shop
          </Link>
        </p>
      </div>
    </main>
  );
}
