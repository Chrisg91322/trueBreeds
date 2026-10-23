import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { parseHealthCertificates } from "@/lib/health-certificates";
import { formatAnimalDate, linkedPuppies, parentBioLink } from "@/lib/animal-family";
import { SiteLink } from "@/components/site/site-base-path";
import { ShieldCheck, Award, ExternalLink } from "lucide-react";

export const revalidate = 60;

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant: slug, id } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  const animal = data.animals.find((a) => a.id === id);
  if (!animal) notFound();

  const healthTests = Array.isArray(animal.healthTests)
    ? (animal.healthTests as { test: string; result?: string; date?: string; certUrl?: string }[])
    : [];
  const certificates = parseHealthCertificates(animal.healthCertificates);
  const sire = parentBioLink(animal.id, animal.sireName, animal.sireId, data.animals);
  const dam = parentBioLink(animal.id, animal.damName, animal.damId, data.animals);
  const puppies = linkedPuppies(animal.id, data.animals);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100">
        {animal.coverPhotoUrl && (
          <Image src={animal.coverPhotoUrl} alt={animal.name} fill className="object-cover" />
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="site-font-heading text-3xl font-semibold">{animal.name}</h1>
            {animal.isRetired && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                Retired
              </span>
            )}
          </div>
          <p className="mt-1 site-muted">
            {[
              animal.breed,
              animal.sex === "male" ? "Male" : "Female",
              animal.color,
              animal.coatType,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {(sire || dam) && (
            <p className="mt-2 text-sm">
              {sire && (
                <>
                  Sire: <ParentName parent={sire} />
                </>
              )}
              {sire && dam && " · "}
              {dam && (
                <>
                  Dam: <ParentName parent={dam} />
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {animal.titles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {animal.titles.map((title) => (
            <span
              key={title}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900"
            >
              <Award className="h-3.5 w-3.5" /> {title}
            </span>
          ))}
        </div>
      )}

      {animal.bio && <p className="mt-6 whitespace-pre-line leading-relaxed">{animal.bio}</p>}

      {puppies.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold">{puppies.length === 1 ? "Puppy" : "Puppies"}</h2>
          <ul className="mt-2 space-y-2">
            {puppies.map((puppy) => {
              const details = [puppy.color, puppy.coatType, formatAnimalDate(puppy.dateOfBirth)]
                .filter(Boolean)
                .join(" · ");
              return (
                <li key={puppy.id} className="text-sm">
                  <SiteLink href={`/our-dogs/${puppy.id}`} className="font-medium underline underline-offset-4">
                    {puppy.name}
                  </SiteLink>
                  {details ? <span className="site-muted"> · {details}</span> : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {certificates.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold">
            {certificates.length === 1 ? "Health certificate" : "Health certificates"}
          </h2>
          <ul className="mt-2 space-y-2">
            {certificates.map((certificate) => (
              <li key={certificate.url}>
                <a
                  href={certificate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:opacity-80"
                >
                  {certificate.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {healthTests.length > 0 && (
        <div className="mt-10">
          <h2 className="site-font-heading text-xl font-semibold">Health Testing</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {healthTests.map((t) => (
              <div
                key={t.test}
                className="flex items-center gap-3 rounded-xl border site-border p-4"
              >
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <div className="text-sm font-semibold">{t.test}</div>
                  <div className="text-xs site-muted">
                    {[t.result, t.date].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ParentName({ parent }: { parent: { name: string; href: string | null } }) {
  if (!parent.href) return parent.name;
  return (
    <SiteLink href={parent.href} className="font-medium underline underline-offset-4">
      {parent.name}
    </SiteLink>
  );
}
