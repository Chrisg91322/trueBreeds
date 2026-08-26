import { SignupForm } from "@/components/auth/signup-form";
import { PlatformLogo } from "@/components/site/platform-logo";
import { isPlanTier } from "@/lib/plans";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex flex-col items-center gap-8">
        <PlatformLogo />
        <SignupForm plan={isPlanTier(plan) ? plan : undefined} />
      </div>
    </div>
  );
}
