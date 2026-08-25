import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
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
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            B
          </span>
          <span className="text-lg font-semibold">TrueBreeds</span>
        </Link>
        <SignupForm plan={isPlanTier(plan) ? plan : undefined} />
      </div>
    </div>
  );
}
