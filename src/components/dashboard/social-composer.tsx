"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { SocialConnection } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createSocialPost } from "@/lib/actions/social";

export function SocialComposer({ connections }: { connections: SocialConnection[] }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createSocialPost(formData);
        toast.success("Post created");
        const form = document.getElementById("social-composer-form") as HTMLFormElement | null;
        form?.reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create post");
      }
    });
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Connect at least one account above to start drafting posts.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New post</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="social-composer-form" action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              name="caption"
              required
              rows={4}
              placeholder="New litter arriving this spring! 🐾"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="mediaUrls">Photo/video URLs (one per line)</Label>
            <Textarea id="mediaUrls" name="mediaUrls" rows={2} className="mt-1.5" />
          </div>
          <div>
            <Label>Post to</Label>
            <div className="mt-2 flex flex-wrap gap-4">
              {connections.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <Checkbox name="connectionIds" value={c.id} defaultChecked />
                  <span className="capitalize">
                    {c.provider} (@{c.accountName})
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="scheduledAt">Schedule for later (optional)</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" className="mt-1.5 w-fit" />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create post
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
