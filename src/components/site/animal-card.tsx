import Image from "next/image";
import type { Animal } from "@prisma/client";
import { ShieldCheck, Award } from "lucide-react";
import { SiteLink } from "@/components/site/site-base-path";

export function AnimalCard({ animal }: { animal: Animal }) {
  const healthTests = Array.isArray(animal.healthTests)
    ? (animal.healthTests as { test: string; result?: string }[])
    : [];

  return (
    <SiteLink
      href={`/our-dogs/${animal.id}`}
      className="group block overflow-hidden rounded-2xl border site-border site-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        {animal.coverPhotoUrl ? (
          <Image
            src={animal.coverPhotoUrl}
            alt={animal.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm site-muted">
            No photo yet
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="site-font-heading text-lg font-semibold">{animal.name}</div>
          {animal.isRetired && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              Retired
            </span>
          )}
        </div>
        <div className="mt-1 text-sm site-muted">
          {[animal.breed, animal.sex === "male" ? "Male" : "Female", animal.color]
            .filter(Boolean)
            .join(" · ")}
        </div>
        {(animal.titles.length > 0 || healthTests.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {animal.titles.slice(0, 2).map((title) => (
              <span
                key={title}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-900"
              >
                <Award className="h-3 w-3" /> {title}
              </span>
            ))}
            {healthTests.slice(0, 2).map((t) => (
              <span
                key={t.test}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-900"
              >
                <ShieldCheck className="h-3 w-3" /> {t.test}
              </span>
            ))}
          </div>
        )}
      </div>
    </SiteLink>
  );
}
