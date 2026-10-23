import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingPortalButton } from "@/components/dashboard/billing-portal-button";
import { MembershipPlanPicker } from "@/components/dashboard/membership-plan-picker";
import { canChangeMembershipPlan } from "@/lib/billing/plan-change";
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
  const canChange = canChangeMembershipPlan(subscription);
  const setupFeePaid = !!subscription?.setupFeePaid;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="font-medium">Platform membership</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan
              ? setupFeePaid
                ? `${plan.name} at ${formatPlanPrice(plan)}/month. The $297 setup fee is already paid.`
                : `${plan.name} at ${formatPlanPrice(plan)}/month, plus a $297 one-time setup fee.`
              : "Choose a membership during onboarding. Includes a $297 one-time setup fee."}{" "}
            Receipts for renewals, plan changes, and cancellations are emailed to the address on
            your account.
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

        {canChange && plan ? (
          <div className="space-y-3 border-t pt-4">
            <div>
              <h4 className="font-medium">Upgrade or downgrade</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                This only changes the monthly price. The $297 setup fee is not charged again. Stripe
                prorates the difference for the rest of this billing period.
              </p>
            </div>
            <MembershipPlanPicker currentPlan={plan.id} mode="change" />
          </div>
        ) : setupFeePaid && plan ? (
          <div className="space-y-3 border-t pt-4">
            <div>
              <h4 className="font-medium">Choose a monthly plan</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Your $297 setup fee is already paid, so resubscribing only starts the monthly price.
              </p>
            </div>
            <MembershipPlanPicker currentPlan={plan.id} mode="resubscribe" />
          </div>
        ) : null}

        {subscription?.stripeCustomerId ? (
          <div className="space-y-2 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Update your card, download invoices, or cancel from the billing portal.
            </p>
            <BillingPortalButton />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No billing on file yet — finish checkout from the onboarding flow.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
