"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitSalesInquiry } from "@/lib/actions/membership-request";
import { PLAN_LIST, type PlanTier } from "@/lib/plans";

export function StartForm({ initialPlan }: { initialPlan?: PlanTier }) {
  const [plan, setPlan] = useState(initialPlan ?? "unsure");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await submitSalesInquiry({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        plan,
        message: String(form.get("message") || ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-3 text-center">
        <h1 className="font-heading text-2xl font-semibold">We got your note</h1>
        <p className="text-sm text-muted-foreground">
          We’ll follow up at the email you entered to talk through the plan and what you want on
          the site.
        </p>
        <Link href="/" className="inline-block text-sm font-medium text-primary hover:underline">
          Back to TrueBreeds
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Start working with us</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us about your breeding program. We’ll follow up with membership options and pricing
          before setup begins.
        </p>
      </div>
      <form className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="start-name">Name</Label>
          <Input id="start-name" name="name" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="start-email">Email</Label>
          <Input id="start-email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="start-phone">Phone</Label>
          <Input id="start-phone" name="phone" type="tel" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="start-plan">Plan</Label>
          <Select value={plan} onValueChange={(value) => setPlan(value ?? "unsure")}>
            <SelectTrigger id="start-plan" className="mt-1.5 w-full">
              <SelectValue>
                {(value) =>
                  value === "unsure"
                    ? "Not sure yet"
                    : (PLAN_LIST.find((item) => item.id === value)?.name ?? "Not sure yet")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PLAN_LIST.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
              <SelectItem value="unsure">Not sure yet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="start-message">What are you interested in?</Label>
          <Textarea
            id="start-message"
            name="message"
            required
            rows={5}
            className="mt-1.5"
            placeholder="Animals, pages, photos, and anything else you want on the site."
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send message
        </Button>
      </form>
    </div>
  );
}
