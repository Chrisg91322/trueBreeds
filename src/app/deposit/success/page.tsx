import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function DepositSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ depositId?: string }>;
}) {
  const { depositId } = await searchParams;
  const deposit = depositId
    ? await prisma.deposit.findUnique({
        where: { id: depositId },
        include: { offspring: true, tenant: true },
      })
    : null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <CheckCircle2 className="h-14 w-14 text-emerald-600" />
      <h1 className="mt-6 text-2xl font-semibold">Deposit received!</h1>
      <p className="mt-3 text-muted-foreground">
        {deposit
          ? `Thanks, ${deposit.buyerName}. Your $${deposit.amount.toLocaleString()} deposit for ${
              deposit.offspring.name ?? "your puppy"
            } is confirmed. ${deposit.tenant.kennelName} will be in touch with next steps.`
          : "Your deposit has been submitted. You'll receive a confirmation email shortly."}
      </p>
      {deposit && (
        <Link
          href={`https://${deposit.tenant.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Back to {deposit.tenant.kennelName}
        </Link>
      )}
    </div>
  );
}
