import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import type { OnboardingProgress } from "@prisma/client";
import { Progress } from "@/components/ui/progress";

const STEPS: { key: keyof OnboardingProgress; label: string; href: string }[] = [
  { key: "profileComplete", label: "Add kennel name, breeds & slug", href: "/onboarding?step=profile" },
  { key: "themeComplete", label: "Pick a theme & upload photos", href: "/onboarding?step=theme" },
  { key: "firstLitterComplete", label: "Add your first litter", href: "/onboarding?step=litter" },
  { key: "stripeConnected", label: "Connect Stripe for deposits", href: "/onboarding?step=stripe" },
  { key: "socialsComplete", label: "Connect socials & Amazon (optional)", href: "/onboarding?step=extras" },
  { key: "billingComplete", label: "Choose a membership & subscribe", href: "/onboarding?step=billing" },
  { key: "published", label: "Publish your site", href: "/onboarding?step=publish" },
];

export function SetupChecklist({ progress }: { progress: OnboardingProgress }) {
  const completed = STEPS.filter((s) => progress[s.key]).length;
  const pct = Math.round((completed / STEPS.length) * 100);

  if (pct === 100) return null;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Finish setting up your site</h3>
        <span className="text-sm text-muted-foreground">{completed}/{STEPS.length} complete</span>
      </div>
      <Progress value={pct} className="mt-3" />
      <ul className="mt-4 space-y-2">
        {STEPS.map((step) => {
          const done = !!progress[step.key];
          return (
            <li key={step.key}>
              <Link
                href={done ? "#" : step.href}
                className={`flex items-center gap-2 text-sm ${
                  done ? "text-muted-foreground line-through" : "hover:underline"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                {step.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
