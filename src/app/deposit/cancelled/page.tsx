import Link from "next/link";
import { XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { youngAnimalLabel } from "@/lib/species";

export default async function DepositCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ depositId?: string }>;
}) {
  const { depositId } = await searchParams;
  const deposit = depositId
    ? await prisma.deposit.findUnique({ where: { id: depositId }, include: { tenant: true } })
    : null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <XCircle className="h-14 w-14 text-muted-foreground" />
      <h1 className="mt-6 text-2xl font-semibold">Checkout cancelled</h1>
      <p className="mt-3 text-muted-foreground">
        No payment was made. You can try again any time from the{" "}
        {deposit ? youngAnimalLabel(deposit.tenant.species) : "animal"}&apos;s listing.
      </p>
      {deposit && (
        <Link
          href={`https://${deposit.tenant.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/available`}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Back to available {youngAnimalLabel(deposit.tenant.species, 2)}
        </Link>
      )}
    </div>
  );
}
