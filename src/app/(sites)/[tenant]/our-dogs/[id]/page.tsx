import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
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

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100">
        {animal.coverPhotoUrl && (
          <Image src={animal.coverPhotoUrl} alt={animal.name} fill className="object-cover" />
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="site-font-heading text-3xl font-semibold">{animal.name}</h1>
          <p className="mt-1 site-muted">
            {[animal.breed, animal.sex === "male" ? "Male" : "Female", animal.color]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {animal.pedigreeUrl && (
          <a
            href={animal.pedigreeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border site-border px-4 py-2 text-sm font-medium hover:opacity-80"
          >
            View Pedigree <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
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
