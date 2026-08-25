"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeadStatus } from "@/lib/actions/leads";
import { LEAD_STATUSES } from "@/lib/lead-status";

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={status}
      disabled={isPending}
      onValueChange={(v) =>
        startTransition(async () => {
          if (!v) return;
          try {
            await updateLeadStatus(leadId, v);
            toast.success("Status updated");
          } catch {
            toast.error("Failed to update");
          }
        })
      }
    >
      <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
