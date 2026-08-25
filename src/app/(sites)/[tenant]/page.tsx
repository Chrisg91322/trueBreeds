import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { Hero } from "@/components/site/hero";
import { SectionHeading } from "@/components/site/section-heading";
import { OffspringCard } from "@/components/site/offspring-card";
import { AnimalCard } from "@/components/site/animal-card";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { Gallery } from "@/components/site/gallery";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: slug } = await params;
  const data = await getPublicTenant(slug);
  if (!data) return {};
  const { tenant } = data;
  return {
    title: `${tenant.kennelName} — ${tenant.tagline ?? "Ethical, health-tested breeder"}`,
    description:
      tenant.tagline ??
      `${tenant.kennelName} raises health-tested ${tenant.breeds.join(", ") || tenant.species} with love. See available puppies and past litters.`,
    openGraph: {
      title: tenant.kennelName,
      description: tenant.tagline ?? undefined,
      images: tenant.heroImageUrl ? [tenant.heroImageUrl] : undefined,
    },
  };
}

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  const { tenant, availableOffspring, upcomingLitters, animals, testimonials, galleryMedia } =
    data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.kennelName,
    description: tenant.tagline ?? undefined,
    email: tenant.contactEmail ?? undefined,
    telephone: tenant.contactPhone ?? undefined,
    address: tenant.address ?? undefined,
    image: tenant.heroImageUrl ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero
        kennelName={tenant.kennelName}
        tagline={tenant.tagline}
        heroImageUrl={tenant.heroImageUrl}
        availableCount={availableOffspring.length}
      />

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Available Now"
            title={
              availableOffspring.length > 0
                ? "Puppies ready for their forever homes"
                : "Nothing available this moment — join the waitlist"
            }
          />
          <Link href="/available" className="site-accent-text text-sm font-semibold hover:opacity-80">
            View all →
          </Link>
        </div>
        {availableOffspring.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {availableOffspring.slice(0, 8).map((o) => (
              <OffspringCard key={o.id} offspring={o} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border site-border site-surface p-10 text-center">
            <p className="site-muted">
              We don&apos;t have any puppies available right now, but we&apos;d love to add you
              to our waitlist for the next litter.
            </p>
            <Link
              href="/contact"
              className="site-accent-bg mt-5 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white"
            >
              Join the Waitlist
            </Link>
          </div>
        )}
      </section>

      {upcomingLitters.length > 0 && (
        <section className="site-surface border-y site-border py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <SectionHeading eyebrow="Coming Soon" title="Expected litters" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {upcomingLitters.map((l) => (
                <div key={l.id} className="rounded-2xl border site-border p-6">
                  <div className="site-font-heading text-lg font-semibold">
                    {l.breed ?? tenant.species} Litter
                  </div>
                  <p className="mt-2 text-sm site-muted">
                    {l.sire?.name && l.dam?.name
                      ? `${l.sire.name} × ${l.dam.name}`
                      : "Parents to be announced"}
                  </p>
                  {l.expectedWhelpDate && (
                    <p className="mt-1 text-sm site-muted">
                      Expected {new Date(l.expectedWhelpDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {animals.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <SectionHeading eyebrow="Meet the Family" title="Our breeding dogs" />
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {animals.slice(0, 4).map((a) => (
              <AnimalCard key={a.id} animal={a} />
            ))}
          </div>
        </section>
      )}

      {galleryMedia.length > 0 && (
        <section className="site-surface border-y site-border py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <SectionHeading eyebrow="Gallery" title="Life at the kennel" />
            <div className="mt-10">
              <Gallery images={galleryMedia} />
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <SectionHeading eyebrow="Kind Words" title="What families are saying" align="center" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
