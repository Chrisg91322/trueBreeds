import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { SectionHeading } from "@/components/site/section-heading";
import { OffspringCard } from "@/components/site/offspring-card";
import { WaitlistForm } from "@/components/site/waitlist-form";

export const revalidate = 60;

export default async function AvailablePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  const upcoming = data.upcomingLitters[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <SectionHeading
        eyebrow="Available"
        title="Available puppies & kittens"
        description={data.tenant.depositPolicy ?? "Browse current litters and reserve your favorite."}
      />
      {data.availableOffspring.length === 0 ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="rounded-2xl border site-border site-surface p-8">
            <p className="site-muted">
              Nothing is currently available. Join the waitlist and we&apos;ll reach out when the
              next litter is ready to reserve.
            </p>
          </div>
          <WaitlistForm
            tenantId={data.tenant.id}
            litterId={upcoming?.id}
            breed={upcoming?.breed ?? data.tenant.breeds[0]}
          />
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {data.availableOffspring.map((o) => (
              <OffspringCard key={o.id} offspring={o} />
            ))}
          </div>
          <div className="mt-16 max-w-xl">
            <WaitlistForm
              tenantId={data.tenant.id}
              litterId={upcoming?.id}
              breed={upcoming?.breed ?? data.tenant.breeds[0]}
            />
          </div>
        </>
      )}
    </div>
  );
}
