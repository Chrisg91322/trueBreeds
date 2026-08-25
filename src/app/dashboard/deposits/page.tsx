import { DollarSign, Undo2, Clock } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RefundDialog } from "@/components/dashboard/refund-dialog";
import { StatCard } from "@/components/dashboard/stat-card";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  refunded: "bg-slate-200 text-slate-700",
  failed: "bg-red-100 text-red-800",
};

export default async function DepositsPage() {
  const session = await requireTenantSession();
  const deposits = await prisma.deposit.findMany({
    where: { tenantId: session.tenantId },
    include: { offspring: { select: { id: true, name: true, litterId: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalCollected = deposits
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + d.amount, 0);
  const totalRefunded = deposits
    .filter((d) => d.status === "refunded")
    .reduce((sum, d) => sum + d.amount, 0);
  const pendingCount = deposits.filter((d) => d.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Deposits</h2>
        <p className="text-sm text-muted-foreground">
          Deposits paid through your public site&apos;s checkout flow. Funds land directly in
          your connected Stripe account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={`$${totalCollected.toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Refunded" value={`$${totalRefunded.toLocaleString()}`} icon={Undo2} />
        <StatCard label="Pending" value={String(pendingCount)} icon={Clock} />
      </div>

      <Card>
        <CardContent className="p-0">
          {deposits.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No deposits yet. Once a buyer reserves an offspring on your site, it will show up
              here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Offspring</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="font-medium">{d.buyerName}</div>
                      <div className="text-xs text-muted-foreground">{d.buyerEmail}</div>
                    </TableCell>
                    <TableCell>{d.offspring?.name || "Unnamed"}</TableCell>
                    <TableCell>${d.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[d.status]} variant="secondary">
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {d.status === "paid" && <RefundDialog depositId={d.id} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
