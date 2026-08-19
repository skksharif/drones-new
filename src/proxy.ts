import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic admin gate.
 *
 * This only looks at whether a session cookie exists — it never verifies the
 * signature, because Proxy runs before the render and, per the Next.js docs,
 * "should not be used as a full session management or authorization solution".
 * Its job is to save a signed-out visitor a wasted round trip. The real check
 * lives in `app/admin/(protected)/layout.tsx` and in every admin server action.
 */

const SESSION_COOKIE = "agrosky_admin";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  // Static assets are excluded, so a redirect can never swallow CSS or images.
  matcher: ["/admin", "/admin/((?!login).*)"],
};
