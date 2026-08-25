import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { SectionHeading } from "@/components/site/section-heading";
import { AnimalCard } from "@/components/site/animal-card";

export const revalidate = 60;

export default async function OurDogsPage({
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
        eyebrow="Our Dogs"
        title={`Meet the ${data.tenant.kennelName} family`}
        description="Every dog in our program is health-tested, titled where applicable, and raised as a beloved family member first."
      />
      {data.animals.length === 0 ? (
        <p className="mt-10 site-muted">Profiles coming soon.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {data.animals.map((a) => (
            <AnimalCard key={a.id} animal={a} />
          ))}
        </div>
      )}
    </div>
  );
}
