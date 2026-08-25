import { NextResponse, type NextRequest } from "next/server";
import { classifyHostname, resolveTenantForHostname } from "@/lib/tenant-resolve";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

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

  // --- Tenant public sites (subdomain or verified custom domain) ----------
  if (resolution.kind === "subdomain" || resolution.kind === "custom-domain") {
    // Never let people hit dashboard/admin/auth routes on a tenant hostname.
    if (
      DASHBOARD_PREFIXES.some((p) => url.pathname.startsWith(p)) ||
      url.pathname.startsWith(ADMIN_PREFIX) ||
      AUTH_PREFIXES.some((p) => url.pathname.startsWith(p))
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

    if (tenant.status === "suspended" || tenant.status === "cancelled") {
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
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  return request.nextUrl.protocol === "http:" ? root : root;
}
