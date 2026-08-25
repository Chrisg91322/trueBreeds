"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { TenantInvite, TenantMember, TenantMemberRole, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import {
  inviteTeamMember,
  cancelInvite,
  removeTeamMember,
  changeMemberRole,
} from "@/lib/actions/settings";

type MemberWithUser = TenantMember & { user: User };

export function TeamSettings({
  members,
  invites,
  currentUserId,
}: {
  members: MemberWithUser[];
  invites: TenantInvite[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleInvite(formData: FormData) {
    startTransition(async () => {
      try {
        await inviteTeamMember(formData);
        toast.success("Invite sent");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send invite");
      }
    });
  }

  function handleRoleChange(memberId: string, role: TenantMemberRole) {
    startTransition(async () => {
      try {
        await changeMemberRole(memberId, role);
        toast.success("Role updated");
      } catch {
        toast.error("Failed to update role");
      }
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      try {
        await removeTeamMember(memberId);
        toast.success("Member removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove member");
      }
    });
  }

  function handleCancelInvite(inviteId: string) {
    startTransition(async () => {
      await cancelInvite(inviteId);
      toast.success("Invite cancelled");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite a team member</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="staff">
                <SelectTrigger id="role" className="mt-1.5 w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send invite
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{m.user.fullName || m.user.email}</div>
                    <div className="text-xs text-muted-foreground">{m.user.email}</div>
                  </TableCell>
                  <TableCell>
                    {m.role === "owner" || m.userId === currentUserId ? (
                      <Badge variant="secondary" className="capitalize">
                        {m.role}
                      </Badge>
                    ) : (
                      <Select
                        defaultValue={m.role}
                        onValueChange={(v) => v && handleRoleChange(m.id, v as TenantMemberRole)}
                      >
                        <SelectTrigger className="w-32 capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {m.role !== "owner" && m.userId !== currentUserId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemove(m.id)}
                        disabled={isPending}
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {invites
                .filter((i) => !i.acceptedAt)
                .map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="font-medium">{i.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Invited &middot; expires {i.expiresAt.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {i.role} (pending)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleCancelInvite(i.id)}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
