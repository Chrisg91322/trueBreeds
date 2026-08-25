import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicTenant } from "@/lib/site-data";
import { SectionHeading } from "@/components/site/section-heading";
import { OffspringCard } from "@/components/site/offspring-card";

export const revalidate = 60;

export default async function AvailablePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <SectionHeading
        eyebrow="Available"
        title="Available puppies & kittens"
        description={data.tenant.depositPolicy ?? undefined}
      />
      {data.availableOffspring.length === 0 ? (
        <div className="mt-10 rounded-2xl border site-border site-surface p-10 text-center">
          <p className="site-muted">
            Nothing is currently available. Reach out to join our waitlist for the next litter.
          </p>
          <Link
            href="/contact"
            className="site-accent-bg mt-5 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white"
          >
            Join the Waitlist
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {data.availableOffspring.map((o) => (
            <OffspringCard key={o.id} offspring={o} />
          ))}
        </div>
      )}
    </div>
  );
}
