import type { Metadata } from "next";
import { MarketingHeader } from "@/components/site/marketing-header";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service & Privacy Policy",
  description:
    "TrueBreeds Terms of Service and Privacy Policy — membership billing, Stripe Connect deposits, Klarna, and how we handle your data.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <LegalPage />
    </div>
  );
}
