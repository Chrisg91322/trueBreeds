import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SocialConnections } from "@/components/dashboard/social-connections";
import { SocialComposer } from "@/components/dashboard/social-composer";
import { SocialPostList } from "@/components/dashboard/social-post-list";

export default async function SocialDashboardPage() {
  const session = await requireTenantSession();
  const [connections, posts] = await Promise.all([
    prisma.socialConnection.findMany({ where: { tenantId: session.tenantId } }),
    prisma.socialPost.findMany({
      where: { tenantId: session.tenantId },
      include: { targets: { include: { connection: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Social</h2>
        <p className="text-sm text-muted-foreground">
          Draft posts for Facebook, Instagram, YouTube, and TikTok from one place.
        </p>
      </div>

      <SocialConnections connections={connections} />
      <SocialComposer connections={connections} />

      <div>
        <h3 className="mb-3 font-medium">Recent posts</h3>
        <SocialPostList posts={posts} />
      </div>
    </div>
  );
}
