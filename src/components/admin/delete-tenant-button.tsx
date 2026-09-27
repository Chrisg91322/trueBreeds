"use client";

import { useActionState } from "react";
import { deleteTenant } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteTenantButton({
  tenantId,
  kennelName,
}: {
  tenantId: string;
  kennelName: string;
}) {
  const [state, action, pending] = useActionState(deleteTenant, null);

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>Delete</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {kennelName}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This permanently removes the kennel, its dogs, litters, payments, and the logins for
          people who only belong to this account. Platform admin logins are kept. This cannot be
          undone.
        </p>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={action}>
          <input type="hidden" name="tenantId" value={tenantId} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
