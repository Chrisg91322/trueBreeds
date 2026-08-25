import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/lib/actions/settings";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await prisma.tenantInvite.findUnique({
    where: { token },
    include: { tenant: true },
  });

  if (!invite) notFound();

  const session = await getSessionContext();
  const expired = invite.acceptedAt || invite.expiresAt < new Date();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">Join {invite.tenant.kennelName}</h1>
      {expired ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {invite.acceptedAt
            ? "This invite has already been accepted."
            : "This invite has expired. Ask your team owner to send a new one."}
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted-foreground">
            You&apos;ve been invited to join as <strong>{invite.role}</strong>. Sign in with{" "}
            <strong>{invite.email}</strong> to accept.
          </p>
          {session ? (
            <form action={acceptInvite.bind(null, token)} className="mt-6">
              <Button type="submit" size="lg">
                Accept invite
              </Button>
            </form>
          ) : (
            <Button
              size="lg"
              className="mt-6"
              render={<a href={`/login?next=/invite/${token}`} />}
            >
              Sign in to continue
            </Button>
          )}
        </>
      )}
    </div>
  );
}
