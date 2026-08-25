import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { SectionHeading } from "@/components/site/section-heading";
import { TestimonialCard } from "@/components/site/testimonial-card";

export const revalidate = 60;

export default async function TestimonialsPage({
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
        eyebrow="Kind Words"
        title="What families are saying"
        align="center"
      />
      {data.testimonials.length === 0 ? (
        <p className="mt-10 text-center site-muted">No testimonials published yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {data.testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      )}
    </div>
  );
}
