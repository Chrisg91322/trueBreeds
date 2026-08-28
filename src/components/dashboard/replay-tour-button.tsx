"use client";

import { useTransition } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetDashboardTour } from "@/lib/actions/onboarding";

export function ReplayTourButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => resetDashboardTour())}
    >
      <HelpCircle className="h-4 w-4" />
      Replay tour
    </Button>
  );
}
