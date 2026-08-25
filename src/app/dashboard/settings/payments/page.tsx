import { CheckCircle2, Clock } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectStripeButton } from "@/components/dashboard/connect-stripe-button";

export default async function PaymentsSettingsPage() {
  const session = await requireTenantSession();
  const account = await prisma.stripeConnectAccount.findUnique({
    where: { tenantId: session.tenantId },
  });

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="font-medium">Stripe Connect</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Buyer deposits are paid straight into your own bank account via Stripe. The platform
            never touches or holds your money.
          </p>
        </div>

        {account?.chargesEnabled ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            Stripe is connected and ready to accept deposits.
          </div>
        ) : account?.detailsSubmitted ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Clock className="h-4 w-4" />
            Your details were submitted and are being reviewed by Stripe.
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {account ? "Finish connecting your Stripe account to start accepting deposits." : "You haven't connected Stripe yet."}
          </div>
        )}

        <div className="flex items-center gap-3">
          <ConnectStripeButton label={account ? "Continue setup" : "Connect Stripe"} />
          {account && (
            <Badge variant="secondary">
              Payouts {account.payoutsEnabled ? "enabled" : "pending"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
