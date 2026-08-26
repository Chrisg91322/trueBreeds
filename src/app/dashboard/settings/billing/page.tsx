import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingPortalButton } from "@/components/dashboard/billing-portal-button";
import { formatPlanPrice, getPlan } from "@/lib/plans";

const STATUS_STYLES: Record<string, string> = {
  incomplete: "bg-slate-200 text-slate-700",
  trialing: "bg-sky-100 text-sky-800",
  active: "bg-emerald-100 text-emerald-800",
  past_due: "bg-amber-100 text-amber-800",
  grace_period: "bg-amber-100 text-amber-800",
  suspended: "bg-red-100 text-red-800",
  cancelled: "bg-slate-200 text-slate-700",
};

export default async function BillingSettingsPage() {
  const session = await requireTenantSession();
  const subscription = await prisma.platformSubscription.findUnique({
    where: { tenantId: session.tenantId },
  });

  const plan = subscription?.plan ? getPlan(subscription.plan) : null;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="font-medium">Platform membership</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan
              ? `${plan.name} at ${formatPlanPrice(plan)}/month, plus a $297 one-time setup fee.`
              : "Choose a membership during onboarding. Includes a $297 one-time setup fee."}{" "}
            Change or cancel any time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant="secondary" className={STATUS_STYLES[subscription?.status ?? "incomplete"]}>
            {(subscription?.status ?? "incomplete").replace("_", " ")}
          </Badge>
        </div>

        {subscription?.currentPeriodEnd && (
          <p className="text-sm text-muted-foreground">
            {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"} on{" "}
            {subscription.currentPeriodEnd.toLocaleDateString()}
          </p>
        )}

        {subscription?.gracePeriodEndsAt && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your last payment failed. Update your payment method by {subscription.gracePeriodEndsAt.toLocaleDateString()}{" "}
            to avoid your site being suspended.
          </div>
        )}

        {subscription?.stripeCustomerId ? (
          <BillingPortalButton />
        ) : (
          <p className="text-sm text-muted-foreground">
            No billing on file yet — finish checkout from the onboarding flow.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
