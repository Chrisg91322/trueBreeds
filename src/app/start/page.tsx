import type { Metadata } from "next";
import { MarketingHeader } from "@/components/site/marketing-header";
import { StartForm } from "@/components/site/start-form";
import { isPlanTier } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Start working with us",
  description:
    "Tell TrueBreeds what you want on your site. We’ll follow up about Basic, Pro, or Premium for livestock, dog, and cat breeders.",
};

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="px-4 py-12 sm:px-6 sm:py-16">
        <StartForm initialPlan={isPlanTier(plan) ? plan : undefined} />
      </main>
    </div>
  );
}
