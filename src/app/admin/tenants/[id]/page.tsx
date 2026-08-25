import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { PawPrint, Heart, DollarSign, Users } from "lucide-react";
import { startImpersonation, suspendTenant, reactivateTenant } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      subscription: true,
      stripeAccount: true,
      members: { include: { user: true } },
    },
  });
  if (!tenant) notFound();

  const [animalCount, litterCount, depositAgg] = await Promise.all([
    prisma.animal.count({ where: { tenantId: id } }),
    prisma.litter.count({ where: { tenantId: id } }),
    prisma.deposit.aggregate({ where: { tenantId: id, status: "paid" }, _sum: { amount: true } }),
  ]);

  const isSuspended = tenant.status === "suspended";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{tenant.kennelName}</h1>
          <p className="text-sm text-muted-foreground">{tenant.slug}.truebreeds.com</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {tenant.status.replace("_", " ")}
          </Badge>
          <form action={startImpersonation.bind(null, tenant.id)}>
            <Button type="submit" variant="outline">
              Impersonate
            </Button>
          </form>
          {isSuspended ? (
            <form action={reactivateTenant.bind(null, tenant.id)}>
              <Button type="submit">Reactivate</Button>
            </form>
          ) : (
            <form action={suspendTenant.bind(null, tenant.id)}>
              <Button type="submit" variant="destructive">
                Suspend
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Dogs" value={animalCount} icon={PawPrint} />
        <StatCard label="Litters" value={litterCount} icon={Heart} />
        <StatCard
          label="Deposits collected"
          value={`$${(depositAgg._sum.amount ?? 0).toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard label="Team members" value={tenant.members.length} icon={Users} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>
              Status: <span className="font-medium capitalize">{tenant.subscription?.status.replace("_", " ") ?? "none"}</span>
            </div>
            <div>
              Plan:{" "}
              <span className="font-medium capitalize">{tenant.subscription?.plan ?? "none"}</span>
            </div>
            {tenant.subscription?.currentPeriodEnd && (
              <div>Renews: {tenant.subscription.currentPeriodEnd.toLocaleDateString()}</div>
            )}
            {tenant.subscription?.gracePeriodEndsAt && (
              <div className="text-amber-700">
                Grace period ends {tenant.subscription.gracePeriodEndsAt.toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stripe Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {tenant.stripeAccount ? (
              <>
                <div>Charges enabled: {tenant.stripeAccount.chargesEnabled ? "Yes" : "No"}</div>
                <div>Payouts enabled: {tenant.stripeAccount.payoutsEnabled ? "Yes" : "No"}</div>
              </>
            ) : (
              <div className="text-muted-foreground">Not connected yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {tenant.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-6 py-3 text-sm">
              <div>
                <div className="font-medium">{m.user.fullName || m.user.email}</div>
                <div className="text-xs text-muted-foreground">{m.user.email}</div>
              </div>
              <Badge variant="secondary" className="capitalize">
                {m.role}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
