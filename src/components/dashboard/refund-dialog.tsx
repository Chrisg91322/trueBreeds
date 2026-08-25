"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { refundDepositAction } from "@/lib/actions/deposits";

export function RefundDialog({ depositId }: { depositId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await refundDepositAction(depositId, formData);
        toast.success("Deposit refunded");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Refund failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-destructive" />}>
        Refund
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund deposit</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="reason">Reason (required)</Label>
            <Textarea id="reason" name="reason" required rows={3} className="mt-1.5" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} variant="destructive">
              {isPending ? "Refunding…" : "Confirm refund"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
