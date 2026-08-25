import Image from "next/image";
import Link from "next/link";
import type { Offspring, Litter } from "@prisma/client";
import { StatusPill } from "./status-pill";

export function OffspringCard({
  offspring,
}: {
  offspring: Offspring & { litter: Pick<Litter, "id" | "breed" | "whelpDate" | "goHomeDate"> };
}) {
  return (
    <Link
      href={`/available/${offspring.id}`}
      className="group block overflow-hidden rounded-2xl border site-border site-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {offspring.coverPhotoUrl ? (
          <Image
            src={offspring.coverPhotoUrl}
            alt={offspring.name ?? "Puppy"}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm site-muted">
            Photo coming soon
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusPill status={offspring.status} />
        </div>
      </div>
      <div className="p-5">
        <div className="site-font-heading text-lg font-semibold">
          {offspring.name ?? `${offspring.litter.breed ?? "Puppy"} — ${offspring.sex === "male" ? "Male" : "Female"}`}
        </div>
        <div className="mt-1 text-sm site-muted">
          {[offspring.litter.breed, offspring.sex === "male" ? "Male" : "Female", offspring.color]
            .filter(Boolean)
            .join(" · ")}
        </div>
        {offspring.price != null && (
          <div className="mt-3 text-base font-semibold">
            ${offspring.price.toLocaleString()}
            {offspring.depositAmount != null && (
              <span className="ml-2 text-xs font-normal site-muted">
                (${offspring.depositAmount.toLocaleString()} deposit)
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
