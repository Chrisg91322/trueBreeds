"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { SocialPost, SocialPostTarget, SocialConnection } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Trash2, Check } from "lucide-react";
import { markPostTargetPosted, deleteSocialPost } from "@/lib/actions/social";

type PostWithTargets = SocialPost & {
  targets: (SocialPostTarget & { connection: SocialConnection })[];
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-200 text-slate-700",
  scheduled: "bg-sky-100 text-sky-800",
  posted: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  awaiting_manual: "bg-amber-100 text-amber-800",
};

export function SocialPostList({ posts }: { posts: PostWithTargets[] }) {
  const [isPending, startTransition] = useTransition();

  if (posts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No posts yet. Create your first one above.
      </p>
    );
  }

  function handleCopy(caption: string) {
    navigator.clipboard.writeText(caption);
    toast.success("Caption copied");
  }

  function handleMarkPosted(targetId: string) {
    startTransition(async () => {
      await markPostTargetPosted(targetId);
      toast.success("Marked as posted");
    });
  }

  function handleDelete(postId: string) {
    startTransition(async () => {
      await deleteSocialPost(postId);
    });
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-start justify-between gap-4">
              <p className="whitespace-pre-line text-sm">{post.caption}</p>
              <div className="flex shrink-0 gap-1">
                <Button variant="outline" size="icon" onClick={() => handleCopy(post.caption)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  disabled={isPending}
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.targets.map((t) => (
                <div key={t.id} className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
                  <span className="capitalize font-medium">{t.provider}</span>
                  <Badge variant="secondary" className={STATUS_STYLES[t.status]}>
                    {t.status.replace("_", " ")}
                  </Badge>
                  {t.status !== "posted" && (
                    <button
                      onClick={() => handleMarkPosted(t.id)}
                      disabled={isPending}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      title="Mark as posted"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {post.scheduledAt && (
              <p className="text-xs text-muted-foreground">
                Scheduled for {post.scheduledAt.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
