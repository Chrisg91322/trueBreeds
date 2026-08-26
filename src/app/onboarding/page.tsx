import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionContext } from "@/lib/auth";
import { ensureTenantForCurrentUser } from "@/lib/actions/onboarding";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { PlatformLogo } from "@/components/site/platform-logo";
import { isPlanTier, PLAN_COOKIE } from "@/lib/plans";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; plan?: string }>;
}) {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (session.platformRole === "platform_admin") redirect("/admin");

  const tenantId = session.tenantId ?? (await ensureTenantForCurrentUser());
  const { step, plan } = await searchParams;
  const cookiePlan = (await cookies()).get(PLAN_COOKIE)?.value;
  const initialPlan = isPlanTier(plan) ? plan : isPlanTier(cookiePlan) ? cookiePlan : undefined;

  const [tenant, progress] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
    prisma.onboardingProgress.upsert({
      where: { tenantId },
      update: {},
      create: { tenantId },
    }),
  ]);

  if (progress.published) redirect("/dashboard");

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-12 sm:py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <PlatformLogo href="/dashboard" />
        <h1 className="mt-6 text-2xl font-semibold">Let&apos;s get your site live</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A few quick steps and {tenant.kennelName === "My Kennel" ? "your kennel" : tenant.kennelName} will be online.
        </p>
      </div>
      <OnboardingWizard tenant={tenant} progress={progress} initialStep={step} initialPlan={initialPlan} />
    </div>
  );
}
