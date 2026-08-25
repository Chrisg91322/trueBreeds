import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { SectionHeading } from "@/components/site/section-heading";

export const revalidate = 60;

export default async function PastLittersPage({
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
        eyebrow="Our History"
        title="Past litters"
        description="A look back at the puppies we've raised and placed in loving homes."
      />
      {data.pastLitters.length === 0 ? (
        <p className="mt-10 site-muted">No past litters published yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {data.pastLitters.map((l) => (
            <div key={l.id} className="overflow-hidden rounded-2xl border site-border site-surface">
              <div className="relative aspect-[4/3] w-full bg-neutral-100">
                {l.coverPhotoUrl && (
                  <Image src={l.coverPhotoUrl} alt={l.breed ?? "Litter"} fill className="object-cover" />
                )}
              </div>
              <div className="p-5">
                <div className="site-font-heading font-semibold">
                  {l.sire?.name && l.dam?.name ? `${l.sire.name} × ${l.dam.name}` : l.breed ?? "Litter"}
                </div>
                <div className="mt-1 text-sm site-muted">
                  {l.whelpDate ? new Date(l.whelpDate).toLocaleDateString() : ""} ·{" "}
                  {l.offspring.length} {l.offspring.length === 1 ? "puppy" : "puppies"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
