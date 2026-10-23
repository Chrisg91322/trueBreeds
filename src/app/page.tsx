import Image from "next/image";
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
import { MarketingHeader } from "@/components/site/marketing-header";
import { PricingCards } from "@/components/site/pricing-cards";
import { buttonVariants } from "@/components/ui/button-variants";
import { PLATFORM_HERO_URL } from "@/lib/platform-branding";
import { appOrigin } from "@/lib/seo";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Users,
    title: "Inquiries, waitlists, and animals in one place",
    description:
      "Every buyer inquiry, waitlist signup, and animal lives in the CRM, so you are not tracking a breeding program in a spreadsheet.",
  },
  {
    icon: Camera,
    title: "A website we set up and keep current",
    description:
      "Send photos, text, and new pages. We apply those updates within the hours included in your monthly plan.",
  },
  {
    icon: Sparkles,
    title: "Quick and easy setup",
    description:
      "Tell us what you need. We build the site for your livestock, dogs, or cats, and you review it before it goes live.",
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
      "Recommend the food, crates, and supplies you actually use, with your own Associates tag and click tracking.",
  },
  {
    icon: Share2,
    title: "Share new litters to social",
    description: "On Premium, publish once and share litter updates to Facebook, Instagram, and YouTube.",
  },
];

export default function MarketingHomePage() {
  const origin = appOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TrueBreeds",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: origin,
    description:
      "A CRM for livestock, dog, and cat breeders — inquiries, animals, and a website we set up and keep current.",
  };

  return (
    <div className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />

      <section className="border-b bg-background">
        <div className="px-4 pt-5 pb-8 sm:px-10 sm:pt-8 sm:pb-10">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="flex flex-col md:block">
              {/* In-flow above the photo on mobile; overlays the photo from md up. */}
              <div className="order-1 px-1 pb-5 text-center md:absolute md:inset-x-0 md:top-0 md:z-10 md:px-10 md:pb-0 md:pt-10">
                <div className="mx-auto inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-sage/40 bg-card/90 px-2.5 py-1 text-[0.7rem] font-medium tracking-wide text-primary shadow-sm sm:px-3 sm:text-xs">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-coral sm:h-4 sm:w-4" />
                  <span className="truncate">Fast and easy setup</span>
                </div>
                <h1 className="font-heading mx-auto mt-3 max-w-3xl text-balance text-[1.7rem] font-semibold leading-tight tracking-tight sm:text-4xl md:mt-5 md:text-5xl md:leading-tight lg:text-6xl">
                Built around the animal breeders community
                </h1>
              </div>

              <div className="order-2 md:order-none">
                {PLATFORM_HERO_URL ? (
                  <Image
                    src={PLATFORM_HERO_URL}
                    alt=""
                    width={2048}
                    height={605}
                    priority
                    sizes="100vw"
                    className="h-auto w-full object-contain object-bottom"
                  />
                ) : (
                  <div className="aspect-[2048/605] w-full bg-muted" />
                )}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-background/10 via-background/0 to-transparent md:block" />
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-2 pb-10 text-center sm:px-6 sm:pt-6 sm:pb-12">
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
            Inquiries, animals, and your website live in one place. We set the site up and apply the
            monthly updates you send — photos, text, and new pages.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Link href="/start" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
              Get started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
            <Link
              href="/faq"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              Ask about pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
              <div className="inline-flex rounded-xl bg-secondary p-2.5">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t bg-muted/30 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Memberships that grow with your breeding program
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Basic, Pro, and Premium each include a website we set up and keep current. Tell us about
            your program and we’ll share pricing and which plan fits.
          </p>
          <div className="mt-8 text-left sm:mt-10">
            <PricingCards showPrices={false} />
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} trueBreeds ·{" "}
        <Link href="/faq" className="hover:underline">
          FAQ
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
