import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getSession } from "@/lib/auth";

/**
 * The authorization boundary.
 *
 * `proxy.ts` also bounces signed-out visitors, but that is an optimistic check
 * on cookie presence only — the Next.js docs are explicit that Proxy "should
 * not be used as a full session management or authorization solution". This
 * layout verifies the signature, and every admin server action re-checks it,
 * because a layout guard alone does not protect an action someone POSTs
 * directly.
 */
export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <AdminNav username={session.username} />
      <main className="container-page w-full flex-1 py-6 sm:py-8">{children}</main>
    </>
  );
}
