"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { SocialConnection, SocialProviderType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { connectSocialAccount, disconnectSocialAccount } from "@/lib/actions/social";

const PROVIDERS: { key: SocialProviderType; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
];

export function SocialConnections({ connections }: { connections: SocialConnection[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDisconnect(connectionId: string) {
    startTransition(async () => {
      await disconnectSocialAccount(connectionId);
      toast.success("Disconnected");
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PROVIDERS.map((p) => {
        const connection = connections.find((c) => c.provider === p.key);
        return (
          <Card key={p.key}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <div className="font-medium">{p.label}</div>
                {connection ? (
                  <div className="mt-1 text-sm text-muted-foreground">@{connection.accountName}</div>
                ) : (
                  <div className="mt-1 text-sm text-muted-foreground">Not connected</div>
                )}
              </div>
              {connection ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDisconnect(connection.id)}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <ConnectDialog provider={p.key} label={p.label} />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ConnectDialog({ provider, label }: { provider: SocialProviderType; label: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await connectSocialAccount(formData);
        toast.success(`${label} connected`);
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to connect");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Connect</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect {label}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="provider" value={provider} />
          <p className="text-sm text-muted-foreground">
            Full one-click sign-in is coming soon. For now, enter your handle so you can draft
            posts here — you&apos;ll copy the caption and post manually until auto-publish is
            enabled for {label}.
          </p>
          <div>
            <Label htmlFor="accountName">{label} handle</Label>
            <Input id="accountName" name="accountName" required placeholder="yourkennel" className="mt-1.5" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
