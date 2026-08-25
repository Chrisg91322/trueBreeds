"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Offspring } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { setOffspringStatus, deleteOffspring } from "@/lib/actions/offspring";
import { OFFSPRING_STATUSES } from "@/lib/offspring-status";

export function OffspringTable({ offspring }: { offspring: Offspring[] }) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      try {
        await setOffspringStatus(id, status);
        toast.success("Status updated");
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  if (offspring.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No offspring added to this litter yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Sex</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {offspring.map((o) => (
          <TableRow key={o.id}>
            <TableCell className="font-medium">{o.name || "Unnamed"}</TableCell>
            <TableCell className="capitalize">{o.sex}</TableCell>
            <TableCell>{o.price != null ? `$${o.price.toLocaleString()}` : "—"}</TableCell>
            <TableCell>
              <Select
                defaultValue={o.status}
                disabled={isPending}
                onValueChange={(v) => v && handleStatusChange(o.id, v)}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OFFSPRING_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/dashboard/litters/${o.litterId}/offspring/${o.id}`} />}
                >
                  Edit
                </Button>
                <form action={deleteOffspring.bind(null, o.id, o.litterId)}>
                  <Button type="submit" variant="outline" size="sm" className="text-destructive">
                    Delete
                  </Button>
                </form>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
