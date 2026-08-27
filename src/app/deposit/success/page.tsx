import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function DepositSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ depositId?: string; mode?: string }>;
}) {
  const { depositId, mode } = await searchParams;
  const isRequest = mode === "request";
  const deposit = depositId
    ? await prisma.deposit.findUnique({
        where: { id: depositId },
        include: { offspring: true, tenant: true },
      })
    : null;

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "truebreeds.com";
  const protocol = root.startsWith("localhost") ? "http" : "https";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <CheckCircle2 className="h-14 w-14 text-emerald-600" />
      <h1 className="mt-6 text-2xl font-semibold">
        {isRequest || deposit?.status === "pending" ? "Reservation received!" : "Deposit received!"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {deposit
          ? isRequest || deposit.status === "pending"
            ? `Thanks, ${deposit.buyerName}. Your reservation for ${
                deposit.offspring.name ?? "this puppy"
              }${
                deposit.amount
                  ? ` ($${deposit.amount.toLocaleString()} deposit)`
                  : ""
              } was sent to ${deposit.tenant.kennelName}. They'll follow up with next steps.`
            : `Thanks, ${deposit.buyerName}. Your $${deposit.amount.toLocaleString()} deposit for ${
                deposit.offspring.name ?? "your puppy"
              } is confirmed. ${deposit.tenant.kennelName} will be in touch with next steps.`
          : "Your reservation has been submitted. You'll hear from the kennel shortly."}
      </p>
      {deposit && (
        <Link
          href={`${protocol}://${deposit.tenant.slug}.${root}`}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Back to {deposit.tenant.kennelName}
        </Link>
      )}
    </div>
  );
}
