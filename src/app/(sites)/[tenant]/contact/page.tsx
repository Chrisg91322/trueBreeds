import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { SectionHeading } from "@/components/site/section-heading";
import { ContactForm } from "@/components/site/contact-form";
import { Mail, Phone, MapPin } from "lucide-react";

export const revalidate = 60;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  const { tenant } = data;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <SectionHeading
        eyebrow="Get in Touch"
        title={`Contact ${tenant.kennelName}`}
        description="Questions about our dogs, availability, or the application process? Send us a note."
      />
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <ContactForm tenantId={tenant.id} />
        <div className="space-y-4 text-sm">
          {tenant.contactEmail && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 site-accent-text" />
              <a href={`mailto:${tenant.contactEmail}`} className="hover:opacity-80">
                {tenant.contactEmail}
              </a>
            </div>
          )}
          {tenant.contactPhone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 site-accent-text" />
              <a href={`tel:${tenant.contactPhone}`} className="hover:opacity-80">
                {tenant.contactPhone}
              </a>
            </div>
          )}
          {tenant.address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 site-accent-text" />
              <span>{tenant.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
