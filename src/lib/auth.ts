import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PlatformRole, TenantMemberRole } from "@prisma/client";

export const IMPERSONATION_COOKIE = "impersonate_tenant_id";

export type SessionContext = {
  userId: string;
  email: string;
  platformRole: PlatformRole;
  tenantId: string | null;
  tenantRole: TenantMemberRole | null;
  tenantSlug: string | null;
  impersonating?: boolean;
};

/**
 * Loads the current Supabase auth user plus their platform role and (first)
 * tenant membership. Returns null when signed out.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return null;

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email },
    create: {
      id: user.id,
      email: user.email,
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      platformRole: isBootstrapAdmin(user.email) ? "platform_admin" : "breeder_owner",
    },
    include: {
      memberships: { include: { tenant: true }, take: 1, orderBy: { createdAt: "asc" } },
    },
  });

  if (dbUser.platformRole === "platform_admin") {
    const impersonatingTenantId = (await cookies()).get(IMPERSONATION_COOKIE)?.value;
    if (impersonatingTenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: impersonatingTenantId } });
      if (tenant) {
        return {
          userId: dbUser.id,
          email: dbUser.email,
          platformRole: dbUser.platformRole,
          tenantId: tenant.id,
          tenantRole: "owner",
          tenantSlug: tenant.slug,
          impersonating: true,
        };
      }
    }
  }

  const membership = dbUser.memberships[0];

  return {
    userId: dbUser.id,
    email: dbUser.email,
    platformRole: dbUser.platformRole,
    tenantId: membership?.tenantId ?? null,
    tenantRole: membership?.role ?? null,
    tenantSlug: membership?.tenant.slug ?? null,
  };
}

function isBootstrapAdmin(email: string) {
  const admins = (process.env.PLATFORM_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

/** Requires an authenticated user with a tenant; redirects otherwise. */
export async function requireTenantSession(): Promise<SessionContext & { tenantId: string; tenantSlug: string }> {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (!session.tenantId || !session.tenantSlug) redirect("/onboarding");
  return session as SessionContext & { tenantId: string; tenantSlug: string };
}

/** Requires a platform_admin user; redirects otherwise. */
export async function requirePlatformAdmin(): Promise<SessionContext> {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (session.platformRole !== "platform_admin") redirect("/dashboard");
  return session;
}
