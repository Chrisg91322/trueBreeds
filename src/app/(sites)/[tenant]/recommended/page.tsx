import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { SectionHeading } from "@/components/site/section-heading";
import { ExternalLink } from "lucide-react";

export const revalidate = 60;

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food & Nutrition",
  crates: "Crates & Travel",
  toys: "Toys & Enrichment",
  grooming: "Grooming",
  other: "Everything Else",
};

export default async function RecommendedPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  if (data.affiliateProducts.length === 0) notFound();

  const grouped = data.affiliateProducts.reduce<Record<string, typeof data.affiliateProducts>>(
    (acc, p) => {
      (acc[p.category] ??= []).push(p);
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <SectionHeading
        eyebrow="Shop Our Favorites"
        title="What we use & recommend"
        description="Products we personally use and trust with our own dogs."
      />

      <p className="mt-6 rounded-lg bg-neutral-50 p-4 text-xs site-muted">
        As an Amazon Associate, {data.tenant.kennelName} earns from qualifying purchases. Links
        below go to Amazon and may earn this breeder a small commission at no extra cost to you.
      </p>

      <div className="mt-10 space-y-12">
        {Object.entries(grouped).map(([category, products]) => (
          <div key={category}>
            <h2 className="site-font-heading text-xl font-semibold">
              {CATEGORY_LABELS[category] ?? category}
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
              {products.map((p) => (
                <a
                  key={p.id}
                  href={`/api/affiliate/click?productId=${p.id}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="group block overflow-hidden rounded-xl border site-border site-surface"
                >
                  <div className="relative aspect-square w-full bg-neutral-100">
                    {p.imageUrl && (
                      <Image
                        src={p.imageUrl}
                        alt={p.title ?? "Product"}
                        fill
                        className="object-contain p-4 transition-transform group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="line-clamp-2 text-sm font-medium">{p.title ?? "View on Amazon"}</div>
                    <div className="mt-2 flex items-center justify-between">
                      {p.price && <span className="text-sm font-semibold">{p.price}</span>}
                      <ExternalLink className="h-3.5 w-3.5 site-muted" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
