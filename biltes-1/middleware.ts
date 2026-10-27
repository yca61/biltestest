import { NextResponse, type NextRequest } from "next/server";

const PASS = /^\/(_next|api|uploads|admin|favicon|robots\.txt|sitemap)/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    // Hızlı ön kontrol; asıl doğrulama sunucuda (lib/auth.ts) yapılır.
    if (!pathname.startsWith("/admin/login") && !pathname.startsWith("/admin/sifre") && !req.cookies.get("biltes_session")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }
  if (PASS.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
  if (/^\/(tr|en)(\/|$)/.test(pathname)) {
    if (pathname.length > 4 && pathname.endsWith("/")) return NextResponse.redirect(new URL(pathname.slice(0, -1) + req.nextUrl.search, req.url), 308);
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/tr" + (pathname === "/" ? "" : pathname.replace(/\/$/, ""));
  return NextResponse.redirect(url, 308);
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
