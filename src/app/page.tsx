import Link from "next/link";
import {
  Sparkles,
  Camera,
  CreditCard,
  Users,
  ShoppingBag,
  Share2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/components/site/pricing-cards";

const FEATURES = [
  {
    icon: Camera,
    title: "A site that looks like a $10k custom build",
    description:
      "Photography-forward themes built for breeders — not another 1998 GeoCities page. Pick a preset, drop in your photos, done.",
  },
  {
    icon: Users,
    title: "Litters, waitlists & leads in one place",
    description:
      "Every inquiry becomes a lead with a timeline. Track puppies from Upcoming to Sold without a spreadsheet.",
  },
  {
    icon: CreditCard,
    title: "Get paid directly, deposits included",
    description:
      "Stripe Connect sends buyer deposits straight to your bank account — we never touch your money.",
  },
  {
    icon: ShoppingBag,
    title: "Your own Amazon storefront",
    description:
      "Recommend the food, crates, and toys you actually use, with your own Associates tag and click tracking.",
  },
  {
    icon: Share2,
    title: "Auto-post new litters to social",
    description: "Publish once, and we queue it to Facebook, Instagram, and YouTube for you.",
  },
  {
    icon: Sparkles,
    title: "Live in under 15 minutes",
    description: "A guided setup wizard takes you from payment to published site the same day.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="flex-1">
      <section className="border-b bg-gradient-to-b from-amber-50/60 to-background">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Built for dog & cat breeders
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            A premium website for your kennel — live today.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            TrueBreeds gives you a stunning, mobile-first site plus the tools to manage litters,
            take deposits, and turn inquiries into sales — all from one dashboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/signup" />} size="lg">
              Start your site <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button render={<Link href="#pricing" />} variant="outline" size="lg">
              See pricing
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border p-6">
              <div className="inline-flex rounded-lg bg-primary/10 p-2.5">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-semibold">Memberships that grow with your kennel</h2>
          <p className="mt-2 text-muted-foreground">Choose Basic, Pro, or Premium. Cancel any time.</p>
          <div className="mt-10 text-left">
            <PricingCards />
          </div>
        </div>
      </section>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TrueBreeds ·{" "}
        <Link href="/terms" className="hover:underline">Terms</Link> ·{" "}
        <Link href="/privacy" className="hover:underline">Privacy</Link>
      </footer>
    </div>
  );
}
