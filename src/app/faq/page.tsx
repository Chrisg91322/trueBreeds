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
    "How TrueBreeds works — set up your kennel site, connect Stripe for deposits, enable Klarna on Premium, and answers to common questions.",
};

const STEPS = [
  {
    icon: Sparkles,
    title: "Create your account & pick a plan",
    body: "Sign up, choose Basic, Pro, or Premium, and complete the $297 setup plus your monthly membership. Billing is handled securely by Stripe on TrueBreeds’ account.",
  },
  {
    icon: Dog,
    title: "Add your kennel details",
    body: "Name your kennel, pick a subdomain (yourkennel.truebreeds.com), add breeds, contact info, and a short story so buyers know who you are.",
  },
  {
    icon: LayoutTemplate,
    title: "Theme, photos, litters & pets",
    body: "Choose a photography-forward theme, upload photos, then add breeding stock and litters. Soft “Reserve now” requests work even before payments are connected.",
  },
  {
    icon: CreditCard,
    title: "Connect Stripe (and Klarna on Premium)",
    body: "Link your own Stripe Express account so buyer deposits go straight to your bank. On Premium, eligible buyers can also use Klarna’s flexible payment options at checkout.",
  },
  {
    icon: Globe,
    title: "Publish — then grow",
    body: "Publish when you’re ready. Add a custom domain anytime, manage leads in the CRM, and on Premium unlock SEO, analytics, social sharing, and your Amazon recommendations page.",
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
            TrueBreeds is a website and kennel toolkit for dog and cat breeders. You get a polished
            public site for litters and pets, plus a dashboard for waitlists, leads, deposits, and
            (on higher plans) agreements, SEO, social posting, and more.
          </p>
        ),
      },
      {
        id: "how-fast",
        question: "How long does it take to go live?",
        answer: (
          <p>
            Most breeders can publish the same day. The guided onboarding wizard walks you through
            kennel profile, theme, first litter, optional Stripe, and billing. You can skip optional
            steps and finish them later from the dashboard.
          </p>
        ),
      },
      {
        id: "kennel-setup",
        question: "How do I add my kennel and get a website address?",
        answer: (
          <>
            <p>
              During onboarding you set your kennel name and a unique slug. Your site is available at{" "}
              <strong>yourslug.truebreeds.com</strong>. Later you can point a custom domain (for
              example <strong>www.yourkennel.com</strong>) at TrueBreeds from Dashboard → Settings →
              Domain.
            </p>
            <p>
              Add breeding animals under Our Pets, litters and puppies/kittens under Litters, then
              publish when the basics look right.
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
            There is a <strong>$297 one-time setup</strong>, then a monthly membership: Basic
            $49.99, Pro $69.99, or Premium $99.99. See{" "}
            <Link href="/#pricing" className="underline underline-offset-2">
              pricing on the homepage
            </Link>
            . You can change or cancel from Billing settings.
          </p>
        ),
      },
      {
        id: "which-plan",
        question: "Which plan do I need for deposits and Klarna?",
        answer: (
          <p>
            Online deposits to your bank use Stripe Connect (set up under Payments). Klarna flexible
            payments for buyers are a Premium feature. Pro adds more pages, digital agreements, and
            lead tracking; Basic covers the core site, litters, waitlist, and contact forms.
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
            Beyond Klarna and Connect deposits, Premium includes more pages, Amazon Associates
            recommendations, social sharing tools, SEO controls, Google Analytics on your kennel
            site, and dashboard analytics — so you can grow beyond a brochure site.
          </p>
        ),
      },
      {
        id: "cats-dogs",
        question: "Do you support dog and cat breeders?",
        answer: (
          <p>
            Yes. TrueBreeds is built for both. Use the same flows for litters, breeding stock, and
            buyer inquiries whether you raise dogs, cats, or both.
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
            From signup to deposits — without the guesswork
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            See how breeders set up a kennel site, connect Stripe for payouts, offer Klarna on
            Premium, and run leads from one dashboard.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
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
          <h2 className="font-heading text-2xl font-semibold">Ready to build your kennel site?</h2>
          <p className="mt-2 text-muted-foreground">
            Start with Basic, Pro, or Premium — you can connect Stripe when you’re ready for paid
            deposits.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
              Create your account <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
            <Link
              href="/#pricing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              Compare plans
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
