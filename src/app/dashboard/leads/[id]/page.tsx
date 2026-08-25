import { notFound } from "next/navigation";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LeadStatusSelect } from "@/components/dashboard/lead-status-select";
import { addLeadNote } from "@/lib/actions/leads";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireTenantSession();
  const lead = await prisma.lead.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      offspring: { include: { litter: true } },
    },
  });
  if (!lead) notFound();

  const boundAddNote = addLeadNote.bind(null, lead.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{lead.name}</h2>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">via {lead.source}</Badge>
            {lead.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
        <LeadStatusSelect leadId={lead.id} status={lead.status} />
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-3 p-5">
          {lead.email && (
            <Button render={<a href={`mailto:${lead.email}`} />} variant="outline" size="sm">
              <Mail className="mr-1.5 h-4 w-4" /> Email
            </Button>
          )}
          {lead.phone && (
            <>
              <Button render={<a href={`tel:${lead.phone}`} />} variant="outline" size="sm">
                <Phone className="mr-1.5 h-4 w-4" /> Call
              </Button>
              <Button render={<a href={`sms:${lead.phone}`} />} variant="outline" size="sm">
                <MessageSquare className="mr-1.5 h-4 w-4" /> Text
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {lead.message && (
        <Card>
          <CardHeader><CardTitle className="text-base">Message</CardTitle></CardHeader>
          <CardContent className="whitespace-pre-line text-sm">{lead.message}</CardContent>
        </Card>
      )}

      {lead.offspring && (
        <Card>
          <CardHeader><CardTitle className="text-base">Interested in</CardTitle></CardHeader>
          <CardContent className="text-sm">
            {lead.offspring.name ?? lead.offspring.litter.breed ?? "A puppy"} —{" "}
            {lead.offspring.status.replace("_", " ")}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form action={boundAddNote} className="space-y-2">
            <Textarea name="body" placeholder="Add a note about this lead..." rows={3} required />
            <Button type="submit" size="sm">Add note</Button>
          </form>

          <div className="space-y-3">
            {lead.notes.length === 0 && (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
            {lead.notes.map((note) => (
              <div key={note.id} className="rounded-lg border p-3 text-sm">
                <p className="whitespace-pre-line">{note.body}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {note.author?.email ?? "Unknown"} · {note.createdAt.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
