"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Sparkles,
  Globe,
  Palette,
  PawPrint,
  Heart,
  Settings,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { completeDashboardTour } from "@/lib/actions/onboarding";

type TourStep = {
  icon: typeof Sparkles;
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
};

const STEPS: TourStep[] = [
  {
    icon: Sparkles,
    title: "Welcome to your kennel dashboard",
    body: "This is your home base. From here you build your public site, add pets and litters, and manage buyers. This quick tour shows where everything lives.",
  },
  {
    icon: Globe,
    title: "Get your page online",
    body: "Finish the setup checklist on Overview (profile, theme, membership, then Publish). Until you’re live, use Preview site in the sidebar to see how your page looks.",
    href: "/onboarding?step=publish",
    hrefLabel: "Go to publish step",
  },
  {
    icon: Palette,
    title: "Change look, text & photos",
    body: "Open Settings → Theme for logo, hero photo, colors, and fonts. Settings → Contact & About is where you edit your story, tagline, and contact details.",
    href: "/dashboard/settings/theme",
    hrefLabel: "Open Theme settings",
  },
  {
    icon: PawPrint,
    title: "Add pets and litters",
    body: "Our Pets is for your adults and breeding stock (photos and bios). Litters is for planned or available litters and puppies/kittens buyers will see on your site.",
    href: "/dashboard/animals",
    hrefLabel: "Open Our Pets",
  },
  {
    icon: Heart,
    title: "Keep pages fresh",
    body: "Update litter status, add offspring photos, and tweak Settings anytime. Leads, Waitlist, and Deposits fill in once people start contacting you from your site.",
    href: "/dashboard/litters",
    hrefLabel: "Open Litters",
  },
  {
    icon: CheckCircle2,
    title: "You’re ready",
    body: "Use the checklist until everything’s done, then Preview or View live site from the sidebar. You can replay this tour anytime from Overview.",
    href: "/dashboard/settings",
    hrefLabel: "Browse Settings",
  },
];

export function WelcomeTour({ openInitially }: { openInitially: boolean }) {
  const [open, setOpen] = useState(openInitially);
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (openInitially) {
      setStep(0);
      setOpen(true);
    }
  }, [openInitially]);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  function finish() {
    startTransition(async () => {
      await completeDashboardTour();
      setOpen(false);
    });
  }

  function onOpenChange(next: boolean) {
    if (!next) {
      finish();
      return;
    }
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!pending}>
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Settings className="h-3.5 w-3.5" />
            Quick tour · {step + 1} of {STEPS.length}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <DialogTitle className="pt-1 text-lg">{current.title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {current.body}
          </DialogDescription>
        </DialogHeader>

        {current.href && (
          <Link
            href={current.href}
            onClick={() => finish()}
            className="text-sm font-medium text-primary hover:underline"
          >
            {current.hrefLabel} →
          </Link>
        )}

        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i === step ? "bg-primary" : i < step ? "bg-primary/40" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="ghost" disabled={pending} onClick={finish}>
            Skip
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
            )}
            {isLast ? (
              <Button type="button" disabled={pending} onClick={finish}>
                Got it
              </Button>
            ) : (
              <Button type="button" disabled={pending} onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
