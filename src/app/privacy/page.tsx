import type { Metadata } from "next";
import { MarketingHeader } from "@/components/site/marketing-header";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "TrueBreeds Privacy Policy — how we collect, use, and share personal information on the platform and kennel sites.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <LegalPage />
    </div>
  );
}
