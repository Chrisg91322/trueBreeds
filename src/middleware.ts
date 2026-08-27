import { NextResponse, type NextRequest } from "next/server";
import { classifyHostname, resolveTenantForHostname } from "@/lib/tenant-resolve";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { prisma } from "@/lib/prisma";

// Runs in the Node.js runtime (not edge) so we can query Postgres directly
// via Prisma to resolve tenants by hostname, and so Supabase's SSR helpers
// have full Node API access.
export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (build assets)
     * - favicon.ico, sitemap.xml, robots.txt
     * - files with an extension (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};

const DASHBOARD_PREFIXES = ["/dashboard", "/onboarding"];
const ADMIN_PREFIX = "/admin";
const AUTH_PREFIXES = ["/login", "/signup", "/reset-password"];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const resolution = classifyHostname(hostname);

  // Supabase email confirms / OAuth sometimes land on Site URL with ?code=
  // (often "/") instead of /auth/callback. Forward so local + production both work.
  const authCode = url.searchParams.get("code");
  if (
    authCode &&
    (resolution.kind === "root" || resolution.kind === "www") &&
    !url.pathname.startsWith("/auth/")
  ) {
    const callback = new URL("/auth/callback", request.url);
    callback.searchParams.set("code", authCode);
    const next = url.searchParams.get("next");
    if (next) callback.searchParams.set("next", next);
    return NextResponse.redirect(callback);
  }

  // --- Owner-only site preview on the platform domain ----------------------
  if (
    (resolution.kind === "root" || resolution.kind === "www") &&
    (url.pathname === "/preview" || url.pathname.startsWith("/preview/"))
  ) {
    const sessionResponse = NextResponse.next();
    const user = await updateSupabaseSession(request, sessionResponse);
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", url.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: {
        tenant: { select: { id: true, slug: true, status: true } },
      },
    });

    if (!membership?.tenant) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    const { tenant } = membership;
    if (tenant.status === "suspended" || tenant.status === "cancelled") {
      return NextResponse.rewrite(
        new URL(`/unavailable?slug=${tenant.slug}`, request.url)
      );
    }

    const rest = url.pathname.slice("/preview".length) || "/";
    const rewritePath = `/${tenant.slug}${rest === "/" ? "" : rest}`;
    const rewrite = NextResponse.rewrite(new URL(`${rewritePath}${url.search}`, request.url));
    rewrite.headers.set("x-truebreeds-preview", "1");
    rewrite.headers.set("x-truebreeds-tenant-slug", tenant.slug);
    rewrite.headers.set("x-truebreeds-tenant-id", tenant.id);
    // Preserve refreshed auth cookies from the session helper.
    sessionResponse.cookies.getAll().forEach((cookie) => {
      rewrite.cookies.set(cookie);
    });
    return rewrite;
  }

  // --- Tenant public sites (subdomain or verified custom domain) ----------
  if (resolution.kind === "subdomain" || resolution.kind === "custom-domain") {
    // Never let people hit dashboard/admin/auth routes on a tenant hostname.
    if (
      DASHBOARD_PREFIXES.some((p) => url.pathname.startsWith(p)) ||
      url.pathname.startsWith(ADMIN_PREFIX) ||
      AUTH_PREFIXES.some((p) => url.pathname.startsWith(p)) ||
      url.pathname.startsWith("/preview")
    ) {
      return NextResponse.redirect(
        `${url.protocol}//${getAppHost(request)}${url.pathname}${url.search}`
      );
    }

    if (url.pathname.startsWith("/api")) {
      // Public API routes (contact form, deposit checkout, affiliate click
      // tracking) are hostname-agnostic — let them through untouched.
      return NextResponse.next();
    }

    let tenant;
    try {
      tenant = await resolveTenantForHostname(hostname);
    } catch (err) {
      console.error("Tenant hostname lookup failed", err);
      return NextResponse.next();
    }

    if (!tenant) {
      const response = NextResponse.rewrite(new URL("/not-found", request.url));
      response.headers.set("x-truebreeds-tenant-missing", "1");
      return response;
    }

    if (
      tenant.status === "suspended" ||
      tenant.status === "cancelled" ||
      !tenant.onboarding?.published ||
      !tenant.onboarding?.billingComplete
    ) {
      const response = NextResponse.rewrite(
        new URL(`/unavailable?slug=${tenant.slug}`, request.url)
      );
      return response;
    }

    const response = NextResponse.rewrite(
      new URL(`/${tenant.slug}${url.pathname}${url.search}`, request.url)
    );
    response.headers.set("x-truebreeds-tenant-slug", tenant.slug);
    response.headers.set("x-truebreeds-tenant-id", tenant.id);
    return response;
  }

  // --- Root platform domain: marketing, auth, dashboard, admin, api -------
  const response = NextResponse.next();
  const user = await updateSupabaseSession(request, response);

  const needsAuth =
    DASHBOARD_PREFIXES.some((p) => url.pathname.startsWith(p)) ||
    url.pathname.startsWith(ADMIN_PREFIX);

  if (needsAuth && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

function getAppHost(request: NextRequest) {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3002";
  return request.nextUrl.protocol === "http:" ? root : root;
}
