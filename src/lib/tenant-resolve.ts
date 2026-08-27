import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Resolves the root platform domain from env, e.g. "truebreeds.com" or
 * "localhost:3002" in development.
 */
export function getRootDomain() {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3002";
}

export type HostnameResolution =
  | { kind: "root" }
  | { kind: "www" }
  | { kind: "subdomain"; slug: string }
  | { kind: "custom-domain"; hostname: string };

/**
 * Classifies an incoming request hostname without touching the database.
 * `{slug}.{rootDomain}` -> subdomain, anything else -> treated as a
 * candidate custom domain (verified against the DB by the caller).
 */
export function classifyHostname(hostnameWithPort: string): HostnameResolution {
  const hostname = hostnameWithPort.split(":")[0].toLowerCase();
  const rootDomain = getRootDomain().split(":")[0].toLowerCase();

  if (hostname === rootDomain) return { kind: "root" };
  if (hostname === `www.${rootDomain}`) return { kind: "www" };

  // Vercel preview / project URLs are the platform app, not tenant sites.
  if (hostname.endsWith(".vercel.app")) return { kind: "root" };

  if (hostname.endsWith(`.${rootDomain}`)) {
    const slug = hostname.slice(0, -1 * (rootDomain.length + 1));
    // Ignore platform infra subdomains that aren't tenants.
    if (["app", "api", "admin", "mail"].includes(slug)) {
      return { kind: "root" };
    }
    return { kind: "subdomain", slug };
  }

  return { kind: "custom-domain", hostname };
}

/** Minimal tenant projection needed for routing + theming. Cached per-request by Next's fetch/data cache is not applicable here (raw Prisma), so keep this call cheap and indexed. */
export async function resolveTenantForHostname(hostnameWithPort: string) {
  const resolution = classifyHostname(hostnameWithPort);

  if (resolution.kind === "subdomain") {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: resolution.slug },
      select: {
        id: true,
        slug: true,
        status: true,
        onboarding: { select: { published: true, billingComplete: true } },
      },
    });
    return tenant;
  }

  if (resolution.kind === "custom-domain") {
    const tenant = await prisma.tenant.findFirst({
      where: {
        customDomain: resolution.hostname,
        customDomainStatus: "verified",
      },
      select: {
        id: true,
        slug: true,
        status: true,
        onboarding: { select: { published: true, billingComplete: true } },
      },
    });
    return tenant;
  }

  return null;
}
