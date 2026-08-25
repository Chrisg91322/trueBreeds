"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import type { Tenant, OnboardingProgress } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEME_PRESETS, type ThemePresetKey } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
  updateTenantProfile,
  updateTenantTheme,
  createFirstLitter,
  markOnboardingStep,
  publishTenant,
} from "@/lib/actions/onboarding";
import { PricingCards } from "@/components/site/pricing-cards";
import { formatPlanPrice, getPlan, isPlanTier, type PlanTier } from "@/lib/plans";

const STEPS = [
  { key: "billing", label: "Billing" },
  { key: "profile", label: "Kennel Profile" },
  { key: "theme", label: "Theme" },
  { key: "litter", label: "First Litter" },
  { key: "stripe", label: "Payments" },
  { key: "extras", label: "Extras" },
  { key: "publish", label: "Publish" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function OnboardingWizard({
  tenant,
  progress,
  initialStep,
  initialPlan,
}: {
  tenant: Tenant;
  progress: OnboardingProgress;
  initialStep?: string;
  initialPlan?: string;
}) {
  const firstIncomplete = STEPS.find((s) => !stepComplete(progress, s.key))?.key ?? "publish";
  const [step, setStep] = useState<StepKey>(
    (STEPS.find((s) => s.key === initialStep)?.key as StepKey) || firstIncomplete
  );

  return (
    <div className="mx-auto max-w-4xl">
      <ol className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => {
          const done = stepComplete(progress, s.key);
          return (
            <li key={s.key}>
              <button
                onClick={() => setStep(s.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                  step === s.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : done
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "text-muted-foreground"
                )}
              >
                {done ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
                {s.label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl border bg-card p-6">
        {step === "billing" && <BillingStep initialPlan={initialPlan} />}
        {step === "profile" && <ProfileStep tenant={tenant} onDone={() => setStep("theme")} />}
        {step === "theme" && <ThemeStep tenant={tenant} onDone={() => setStep("litter")} />}
        {step === "litter" && (
          <LitterStep tenant={tenant} onDone={() => setStep("stripe")} />
        )}
        {step === "stripe" && <StripeStep tenant={tenant} onDone={() => setStep("extras")} />}
        {step === "extras" && <ExtrasStep tenant={tenant} onDone={() => setStep("publish")} />}
        {step === "publish" && <PublishStep tenant={tenant} />}
      </div>
    </div>
  );
}

function stepComplete(progress: OnboardingProgress, step: StepKey) {
  switch (step) {
    case "billing": return progress.billingComplete;
    case "profile": return progress.profileComplete;
    case "theme": return progress.themeComplete;
    case "litter": return progress.firstLitterComplete;
    case "stripe": return progress.stripeConnected;
    case "extras": return progress.socialsComplete;
    case "publish": return progress.published;
  }
}

function BillingStep({ initialPlan }: { initialPlan?: string }) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanTier>(isPlanTier(initialPlan) ? initialPlan : "pro");

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Choose your membership</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Billed monthly. Cancel any time from your billing settings.
        </p>
      </div>
      <PricingCards selectedPlan={plan} onSelect={setPlan} />
      <Button onClick={handlePay} disabled={loading} size="lg">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue with {getPlan(plan).name} ({formatPlanPrice(plan)}/mo)
      </Button>
    </div>
  );
}

function ProfileStep({ tenant, onDone }: { tenant: Tenant; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const kennelName = String(form.get("kennelName") || "");
    const slug = String(form.get("slug") || "");
    const species = String(form.get("species") || "dog") as "dog" | "cat";
    const breeds = String(form.get("breeds") || "")
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        await updateTenantProfile(tenant.id, { kennelName, slug, species, breeds });
        toast.success("Profile saved");
        router.refresh();
        onDone();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Tell us about your kennel</h2>
      <div>
        <Label htmlFor="kennelName">Kennel name</Label>
        <Input id="kennelName" name="kennelName" defaultValue={tenant.kennelName} required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="slug">Your site URL</Label>
        <div className="mt-1.5 flex items-center gap-1 text-sm">
          <Input id="slug" name="slug" defaultValue={tenant.slug} required pattern="[a-z0-9-]+" />
          <span className="text-muted-foreground">.truebreeds.com</span>
        </div>
      </div>
      <div>
        <Label htmlFor="species">Species</Label>
        <Select name="species" defaultValue={tenant.species}>
          <SelectTrigger id="species" className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="dog">Dogs</SelectItem>
            <SelectItem value="cat">Cats</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="breeds">Breed(s), comma-separated</Label>
        <Input id="breeds" name="breeds" defaultValue={tenant.breeds.join(", ")} className="mt-1.5" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save & continue
      </Button>
    </form>
  );
}

function ThemeStep({ tenant, onDone }: { tenant: Tenant; onDone: () => void }) {
  const [preset, setPreset] = useState<ThemePresetKey>(tenant.themePreset);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateTenantTheme(tenant.id, {
          themePreset: preset,
          accentColor: String(form.get("accentColor") || THEME_PRESETS[preset].defaultAccent),
          logoUrl: String(form.get("logoUrl") || "") || undefined,
          heroImageUrl: String(form.get("heroImageUrl") || "") || undefined,
          tagline: String(form.get("tagline") || "") || undefined,
        });
        toast.success("Theme saved");
        router.refresh();
        onDone();
      } catch {
        toast.error("Failed to save theme");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-lg font-semibold">Pick a look</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Object.values(THEME_PRESETS).map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setPreset(t.key)}
            className={cn(
              "rounded-xl border-2 p-3 text-left transition-colors",
              preset === t.key ? "border-primary" : "border-transparent bg-muted/50"
            )}
          >
            <div className="flex gap-1">
              <span className="h-6 w-6 rounded-full" style={{ background: t.background, border: "1px solid #ddd" }} />
              <span className="h-6 w-6 rounded-full" style={{ background: t.defaultAccent }} />
            </div>
            <div className="mt-2 text-sm font-medium">{t.label}</div>
          </button>
        ))}
      </div>
      <div>
        <Label htmlFor="accentColor">Accent color</Label>
        <Input
          id="accentColor"
          name="accentColor"
          type="color"
          defaultValue={tenant.accentColor || THEME_PRESETS[preset].defaultAccent}
          className="mt-1.5 h-10 w-20 p-1"
        />
      </div>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" name="tagline" defaultValue={tenant.tagline ?? ""} className="mt-1.5" placeholder="Health-tested, home-raised Labradors" />
      </div>
      <div>
        <Label htmlFor="logoUrl">Logo image URL</Label>
        <Input id="logoUrl" name="logoUrl" type="url" defaultValue={tenant.logoUrl ?? ""} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="heroImageUrl">Hero photo URL</Label>
        <Input id="heroImageUrl" name="heroImageUrl" type="url" defaultValue={tenant.heroImageUrl ?? ""} className="mt-1.5" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save & continue
      </Button>
    </form>
  );
}

function LitterStep({ tenant, onDone }: { tenant: Tenant; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createFirstLitter(tenant.id, {
          species: tenant.species,
          breed: String(form.get("breed") || "") || undefined,
          status: String(form.get("status") || "planned") as "planned" | "expecting" | "active",
        });
        toast.success("Litter added");
        router.refresh();
        onDone();
      } catch {
        toast.error("Failed to add litter");
      }
    });
  }

  async function handleSkip() {
    startTransition(async () => {
      await markOnboardingStep(tenant.id, "firstLitterComplete");
      router.refresh();
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Add your first litter</h2>
      <p className="text-sm text-muted-foreground">
        You can edit all the details (offspring, pricing, photos) later from the dashboard.
      </p>
      <div>
        <Label htmlFor="breed">Breed</Label>
        <Input id="breed" name="breed" defaultValue={tenant.breeds[0] ?? ""} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue="planned">
          <SelectTrigger id="status" className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="expecting">Expecting</SelectItem>
            <SelectItem value="active">Active (puppies ready to list)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & continue
        </Button>
        <Button type="button" variant="ghost" onClick={handleSkip} disabled={isPending}>
          Skip for now
        </Button>
      </div>
    </form>
  );
}

function StripeStep({ tenant, onDone }: { tenant: Tenant; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleConnect() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect-onboarding", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start Stripe onboarding");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  function handleSkip() {
    startTransition(async () => {
      await markOnboardingStep(tenant.id, "stripeConnected");
      router.refresh();
      onDone();
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Connect Stripe for deposits</h2>
      <p className="text-sm text-muted-foreground">
        Buyer deposits go straight into your own bank account via Stripe Connect — the platform
        never touches your money. Takes about 5 minutes.
      </p>
      <div className="flex gap-2">
        <Button onClick={handleConnect} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Connect Stripe
        </Button>
        <Button type="button" variant="ghost" onClick={handleSkip} disabled={isPending}>
          I&apos;ll do this later
        </Button>
      </div>
    </div>
  );
}

function ExtrasStep({ tenant, onDone }: { tenant: Tenant; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleContinue() {
    startTransition(async () => {
      await markOnboardingStep(tenant.id, "socialsComplete");
      router.refresh();
      onDone();
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Optional: socials & Amazon</h2>
      <p className="text-sm text-muted-foreground">
        Connect Facebook/Instagram/YouTube for auto-posting, and add your Amazon Associates tag
        for the &quot;What We Recommend&quot; page. You can always do this later from Settings.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" render={<Link href="/dashboard/social" />}>
          Connect socials
        </Button>
        <Button variant="outline" render={<Link href="/dashboard/affiliate" />}>
          Set up Amazon
        </Button>
      </div>
      <Button onClick={handleContinue} disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue
      </Button>
    </div>
  );
}

function PublishStep({ tenant }: { tenant: Tenant }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    startTransition(async () => {
      await publishTenant(tenant.id);
      toast.success("Your site is live!");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold">Ready to publish</h2>
      <p className="text-sm text-muted-foreground">
        Your site will be live at <strong>{tenant.slug}.truebreeds.com</strong>.
      </p>
      <Button onClick={handlePublish} disabled={isPending} size="lg">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Publish my site
      </Button>
    </div>
  );
}
