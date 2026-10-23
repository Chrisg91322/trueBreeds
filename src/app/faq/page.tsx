import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Dog,
  Globe,
  LayoutTemplate,
  Sparkles,
  Wallet,
} from "lucide-react";
import { MarketingHeader } from "@/components/site/marketing-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How it works & FAQ",
  description:
    "How TrueBreeds works — a CRM for dog, cat, and livestock breeders, with a website we set up and keep current.",
};

const STEPS = [
  {
    icon: Sparkles,
    title: "Tell us what you need",
    body: "Send a note about your breeding program. We’ll follow up with membership options and pricing before anything is billed.",
  },
  {
    icon: Dog,
    title: "We set up your site",
    body: "Quick and easy setup for dogs, cats, and livestock. We create the site, add your animals, photos, and text, and you review it before it goes live.",
  },
  {
    icon: LayoutTemplate,
    title: "Run buyers from the CRM",
    body: "Inquiries, animals, and your website stay in one place. Pro and Premium add the waitlist and lead tracking. Basic includes the contact form.",
  },
  {
    icon: CreditCard,
    title: "Send monthly updates",
    body: "Each plan includes hours for the changes you send — photos, text, and new pages. Basic includes 1 hour, Pro 2 hours, and Premium 4 hours.",
  },
  {
    icon: Globe,
    title: "Grow on a higher plan",
    body: "Premium adds up to 15 pages, unlimited animals, SEO, analytics, social sharing, Amazon recommendations, Stripe deposits, and Klarna for buyers.",
  },
] as const;

type FaqItem = { id: string; question: string; answer: ReactNode };

const FAQ_SECTIONS: { id: string; title: string; items: FaqItem[] }[] = [
  {
    id: "getting-started",
    title: "Getting started & your kennel",
    items: [
      {
        id: "what-is",
        question: "What is TrueBreeds?",
        answer: (
          <p>
            TrueBreeds is a CRM for breeders of livestock, dogs, and cats. Inquiries, animals, and
            your website live in one place. We set the site up and apply the monthly updates you
            send. Higher plans add a waitlist, lead tracking, agreements, SEO, and social posting.
          </p>
        ),
      },
      {
        id: "how-fast",
        question: "How long does it take to go live?",
        answer: (
          <p>
            Setup is quick and easy, and we do it with you. Tell us about the breeding program, we
            build the site, and you review it before it goes live. After that, monthly updates land
            within the hours on your plan.
          </p>
        ),
      },
      {
        id: "kennel-setup",
        question: "How do I add my kennel and get a website address?",
        answer: (
          <>
            <p>
              We create the site from the name and address you give us. It lives at{" "}
              <strong>yourslug.truebreeds.com</strong>. Later you can point a custom domain (for
              example <strong>www.yourkennel.com</strong>) at TrueBreeds from Dashboard → Settings →
              Domain.
            </p>
            <p>
              Animals and litters are part of the CRM. We add the first ones during setup, and later
              updates come out of your monthly hours.
            </p>
          </>
        ),
      },
      {
        id: "team",
        question: "Can someone else help manage my kennel?",
        answer: (
          <p>
            Yes. Invite team members from Settings → Team so a partner or assistant can update
            litters, leads, and content without sharing your password.
          </p>
        ),
      },
      {
        id: "preview",
        question: "Can I preview before the site is public?",
        answer: (
          <p>
            Yes. While you’re setting up, you can preview your kennel site from onboarding or the
            dashboard. Visitors on the live subdomain see the published site once you complete
            billing and hit Publish.
          </p>
        ),
      },
    ],
  },
  {
    id: "payments",
    title: "Stripe, deposits & Klarna",
    items: [
      {
        id: "two-stripes",
        question: "Why are there two kinds of Stripe payments?",
        answer: (
          <>
            <p>
              <strong>Your TrueBreeds membership</strong> (setup fee + monthly plan) is billed on
              TrueBreeds’ Stripe account. Manage or cancel it anytime under Dashboard → Settings →
              Billing.
            </p>
            <p>
              <strong>Buyer deposits</strong> use Stripe Connect: you connect <em>your</em> Stripe
              Express account so money from buyers lands in <em>your</em> bank. TrueBreeds never
              holds those funds.
            </p>
          </>
        ),
      },
      {
        id: "connect-stripe",
        question: "How do I connect Stripe for buyer deposits?",
        answer: (
          <>
            <p>From onboarding (Stripe step) or Dashboard → Settings → Payments:</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li>Click Connect Stripe.</li>
              <li>Complete Stripe’s Express onboarding (business details, identity, bank account).</li>
              <li>
                When Stripe shows charges and payouts enabled, buyers can pay deposits online from
                your litter/offspring pages.
              </li>
            </ol>
            <p className="mt-3">
              Until Connect is ready, buyers can still use Reserve now — requests show up in Leads
              and Deposits so you can follow up manually.
            </p>
          </>
        ),
      },
      {
        id: "who-gets-money",
        question: "Does TrueBreeds take a cut of my deposits?",
        answer: (
          <p>
            Buyer deposits are paid to your connected Stripe account. Standard Stripe processing fees
            apply (set by Stripe, not by TrueBreeds). Your platform membership is a separate fee for
            using the software.
          </p>
        ),
      },
      {
        id: "klarna",
        question: "How does Klarna work for my buyers?",
        answer: (
          <>
            <p>
              Klarna flexible payments are available on the <strong>Premium</strong> plan where
              enabled. Eligible buyers can choose Klarna at checkout (for example pay later or in
              instalments, subject to Klarna’s rules and the buyer’s country).
            </p>
            <p>
              Klarna is a separate company. Buyers agree to Klarna’s own terms and privacy notice on
              Klarna’s website. Approval, credit checks, and repayment are between the buyer and
              Klarna — not TrueBreeds. See{" "}
              <a
                href="https://www.klarna.com/international/terms/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Klarna’s terms
              </a>{" "}
              and{" "}
              <a
                href="https://www.klarna.com/international/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                privacy notice
              </a>
              .
            </p>
          </>
        ),
      },
      {
        id: "refunds",
        question: "Can I refund a deposit?",
        answer: (
          <p>
            Paid deposits can be refunded from the Deposits area in your dashboard (when Stripe
            Connect is connected and the charge was successful). Soft reservations that were never
            paid don’t need a Stripe refund. Klarna refunds follow Klarna’s then-current policies.
          </p>
        ),
      },
      {
        id: "stripe-terms",
        question: "Where do I find Stripe’s latest terms?",
        answer: (
          <p>
            TrueBreeds links out to Stripe’s live legal pages rather than copying them. Review{" "}
            <a
              href="https://stripe.com/legal"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              stripe.com/legal
            </a>{" "}
            and{" "}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              stripe.com/privacy
            </a>
            . Connected-account rules are covered during Stripe’s onboarding and at{" "}
            <a
              href="https://stripe.com/legal/connect-account"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              stripe.com/legal/connect-account
            </a>
            .
          </p>
        ),
      },
    ],
  },
  {
    id: "billing",
    title: "Plans, pricing & canceling",
    items: [
      {
        id: "pricing",
        question: "What does TrueBreeds cost?",
        answer: (
          <p>
            Membership pricing depends on the plan.{" "}
            <Link href="/start" className="underline underline-offset-2">
              Send us a note
            </Link>{" "}
            and we’ll share current pricing for Basic, Pro, and Premium. You can change or cancel
            from Billing settings once you’re a member.
          </p>
        ),
      },
      {
        id: "which-plan",
        question: "Which plan do I need for deposits and Klarna?",
        answer: (
          <p>
            Online deposits to your bank use Stripe Connect and are part of Premium, along with
            Klarna. Basic is a 1-page site, up to 10 animals, 1 hour of monthly updates, and a
            contact form. Pro adds up to 20 animals, 2 hours, 4 pages, agreements, and waitlist and
            lead tracking. Premium adds unlimited animals, 4 hours, and up to 10 pages.
          </p>
        ),
      },
      {
        id: "cancel",
        question: "Can I cancel anytime?",
        answer: (
          <p>
            Yes. Open Dashboard → Settings → Billing and use the Stripe customer portal, or email{" "}
            <a href="mailto:support@truebreeds.com" className="underline underline-offset-2">
              support@truebreeds.com
            </a>
            . Access continues through the end of the current billing period. The setup fee is
            non-refundable once checkout completes, except where required by law.
          </p>
        ),
      },
    ],
  },
  {
    id: "site-features",
    title: "Your public site & tools",
    items: [
      {
        id: "leads",
        question: "What happens when someone contacts me or joins the waitlist?",
        answer: (
          <p>
            Submissions create leads in your CRM with a timeline you can update. You’ll also get
            email notifications when messaging is configured. Pro and Premium unlock fuller lead
            tracking workflows.
          </p>
        ),
      },
      {
        id: "domain",
        question: "Can I use my own domain name?",
        answer: (
          <p>
            Yes. Keep yourslug.truebreeds.com, and optionally add a custom domain with a CNAME to
            TrueBreeds. Instructions live under Settings → Domain after you sign up.
          </p>
        ),
      },
      {
        id: "premium-extras",
        question: "What else do I get on Premium?",
        answer: (
          <p>
            Premium includes unlimited animals, 4 hours of website updates a month, and up to 10
            pages, plus Amazon Associates recommendations, social sharing, SEO controls, Google
            Analytics, and dashboard analytics.
          </p>
        ),
      },
      {
        id: "cats-dogs",
        question: "Do you support livestock, dogs, and cats?",
        answer: (
          <p>
            Yes. TrueBreeds is a CRM for all three. Livestock is one species choice next to Dog and
            Cat. Litters, breeding stock, and buyer inquiries use the same flows.
          </p>
        ),
      },
    ],
  },
  {
    id: "support",
    title: "Support & legal",
    items: [
      {
        id: "help",
        question: "How do I get help?",
        answer: (
          <p>
            Email{" "}
            <a href="mailto:support@truebreeds.com" className="underline underline-offset-2">
              support@truebreeds.com
            </a>
            . For platform rules and privacy, see our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms &amp; Privacy
            </Link>
            .
          </p>
        ),
      },
      {
        id: "buyer-vs-breeder",
        question: "I’m shopping for a puppy — is this the right site?",
        answer: (
          <p>
            TrueBreeds.com is the platform for breeders. Individual kennels live on their own
            subdomains or custom domains. If a breeder shared a link with you, use that link to view
            litters, join a waitlist, or place a deposit.
          </p>
        ),
      },
    ],
  },
];

export default function FaqHowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.739_0.039_190.1_/_0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.758_0.094_30.1_/_0.12),_transparent_45%)]"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-coral">
            How it works
          </p>
          <h1 className="font-heading mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            A CRM for livestock, dog, and cat breeders
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            See how we set up your site, keep it current each month, and keep inquiries and animals
            in one place.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/start" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
              Get started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
            <a
              href="#faq"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              Jump to FAQ
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex items-center gap-2 text-brand-sage">
          <Wallet className="h-5 w-5" />
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Five steps to a live kennel site
          </h2>
        </div>
        <p className="mt-2 text-muted-foreground">
          Follow the onboarding wizard — or use this as a checklist while you explore the product.
        </p>

        <ol className="mt-10 space-y-0">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 pb-10 last:pb-0 sm:gap-6">
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-10 bottom-0 left-[1.15rem] w-px bg-border sm:left-[1.4rem]"
                />
              )}
              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-sage/40 bg-card text-sm font-semibold text-primary shadow-sm sm:h-11 sm:w-11">
                {index + 1}
              </div>
              <div className="min-w-0 pt-0.5 sm:pt-1.5">
                <div className="flex items-start gap-2">
                  <step.icon className="mt-0.5 hidden h-4 w-4 shrink-0 text-brand-coral sm:block" />
                  <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="border-t bg-muted/30 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Frequently asked questions</h2>
          <p className="mt-2 text-muted-foreground">
            Payments, kennel setup, plans, and what buyers see on your site.
          </p>

          <div className="mt-10 space-y-12">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.id}>
                <h3 className="font-heading text-lg font-semibold text-primary">{section.title}</h3>
                <Accordion className="mt-3 rounded-2xl border bg-card px-4 shadow-sm sm:px-5">
                  {section.items.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="font-heading py-4 text-left text-base font-semibold">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-semibold">Ready to set up your CRM?</h2>
          <p className="mt-2 text-muted-foreground">
            Tell us about your breeding program and we’ll share membership options and pricing.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/start" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
              Ask about pricing <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
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
