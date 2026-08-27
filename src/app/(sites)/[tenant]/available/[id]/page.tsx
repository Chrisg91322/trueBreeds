import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { StatusPill } from "@/components/site/status-pill";
import { DepositForm } from "@/components/site/deposit-form";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { tenantAcceptsCardPayments } from "@/lib/reservations";

export const revalidate = 60;

export default async function OffspringDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant: slug, id } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  const litter = data.litters.find((l) => l.offspring.some((o) => o.id === id));
  const offspring = litter?.offspring.find((o) => o.id === id);
  if (!offspring || !litter) notFound();

  const amount = offspring.depositAmount ?? litter.defaultDepositAmount ?? 0;
  const canReserve = offspring.status === "available" || offspring.status === "upcoming";
  const paymentsEnabled = await tenantAcceptsCardPayments(data.tenant.id);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
          {offspring.coverPhotoUrl && (
            <Image src={offspring.coverPhotoUrl} alt={offspring.name ?? "Puppy"} fill className="object-cover" />
          )}
          <div className="absolute left-3 top-3">
            <StatusPill status={offspring.status} />
          </div>
        </div>

        <div>
          <h1 className="site-font-heading text-3xl font-semibold">
            {offspring.name ?? `${litter.breed ?? "Puppy"}`}
          </h1>
          <p className="mt-1 site-muted">
            {[litter.breed, offspring.sex === "male" ? "Male" : "Female", offspring.color]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {offspring.price != null && (
            <div className="mt-4 text-2xl font-bold">${offspring.price.toLocaleString()}</div>
          )}

          {offspring.notes && <p className="mt-4 whitespace-pre-line leading-relaxed">{offspring.notes}</p>}

          <div className="mt-8">
            {canReserve ? (
              <DepositForm
                tenantId={data.tenant.id}
                offspringId={offspring.id}
                amount={amount}
                depositPolicy={data.tenant.depositPolicy}
                paymentsEnabled={paymentsEnabled}
              />
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border site-border p-6 text-sm site-muted">
                  {offspring.status === "deposit_received" || offspring.status === "reserved"
                    ? "This one is already reserved — join the waitlist for the next litter."
                    : "This listing isn't currently accepting reservations."}
                </div>
                <WaitlistForm
                  tenantId={data.tenant.id}
                  litterId={litter.id}
                  breed={litter.breed ?? undefined}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
