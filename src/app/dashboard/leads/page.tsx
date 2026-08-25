import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  approved: "Approved",
  deposit: "Deposit",
  sold: "Sold",
  archived: "Archived",
};

export default async function LeadsPage() {
  const session = await requireTenantSession();
  const leads = await prisma.lead.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Leads</h2>
        <p className="text-sm text-muted-foreground">
          Every inquiry, waitlist signup, and deposit becomes a lead here.
        </p>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No leads yet. They&apos;ll appear here as soon as buyers reach out.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {lead.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </span>
                      )}
                      <span className="capitalize">via {lead.source}</span>
                    </div>
                  </div>
                  <Badge variant="outline">{STATUS_LABELS[lead.status] ?? lead.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
