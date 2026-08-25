"use client";

import { useTransition } from "react";
import { ArrowUp, ArrowDown, Trash2, Mail, Phone } from "lucide-react";
import type { WaitlistEntry } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { moveWaitlistEntry, deleteWaitlistEntry } from "@/lib/actions/waitlist";

export function WaitlistTable({ entries }: { entries: WaitlistEntry[] }) {
  const [isPending, startTransition] = useTransition();

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No one on the waitlist yet.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">Rank</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Breed / Litter</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, i) => (
          <TableRow key={entry.id}>
            <TableCell className="font-medium">#{i + 1}</TableCell>
            <TableCell>{entry.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {entry.email}</div>
              {entry.phone && (
                <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {entry.phone}</div>
              )}
            </TableCell>
            <TableCell>{entry.breed || "—"}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isPending || i === 0}
                  onClick={() => startTransition(() => moveWaitlistEntry(entry.id, "up"))}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isPending || i === entries.length - 1}
                  onClick={() => startTransition(() => moveWaitlistEntry(entry.id, "down"))}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteWaitlistEntry(entry.id))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
