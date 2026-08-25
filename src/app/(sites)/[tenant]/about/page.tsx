import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { SectionHeading } from "@/components/site/section-heading";
import { Gallery } from "@/components/site/gallery";

export const revalidate = 60;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <SectionHeading eyebrow="Our Story" title={`About ${data.tenant.kennelName}`} />
      <div className="prose prose-neutral mt-8 max-w-none">
        {data.tenant.aboutHtml ? (
          <div dangerouslySetInnerHTML={{ __html: data.tenant.aboutHtml }} />
        ) : (
          <p className="site-muted">This breeder hasn&apos;t added their story yet.</p>
        )}
      </div>
      {data.galleryMedia.length > 0 && (
        <div className="mt-12">
          <Gallery images={data.galleryMedia} />
        </div>
      )}
    </div>
  );
}
