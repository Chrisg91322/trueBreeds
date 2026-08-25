import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { SectionHeading } from "@/components/site/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const revalidate = 60;

export default async function FaqPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  const { tenant, faqItems } = data;

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <SectionHeading eyebrow="Good to Know" title="FAQ &amp; Policies" />

      {faqItems.length > 0 && (
        <Accordion className="mt-8">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="site-font-heading text-left text-base font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="site-muted">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="mt-14 space-y-10">
        {tenant.depositPolicy && (
          <PolicyBlock title="Deposit Policy" content={tenant.depositPolicy} />
        )}
        {tenant.healthGuaranteeHtml && (
          <PolicyBlock title="Health Guarantee" html={tenant.healthGuaranteeHtml} />
        )}
        {tenant.contractHtml && <PolicyBlock title="Purchase Contract" html={tenant.contractHtml} />}
        {tenant.spayNeuterHtml && (
          <PolicyBlock title="Spay / Neuter Terms" html={tenant.spayNeuterHtml} />
        )}
      </div>
    </div>
  );
}

function PolicyBlock({
  title,
  content,
  html,
}: {
  title: string;
  content?: string;
  html?: string;
}) {
  return (
    <div>
      <h2 className="site-font-heading text-xl font-semibold">{title}</h2>
      {html ? (
        <div className="prose prose-neutral mt-3 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="mt-3 site-muted">{content}</p>
      )}
    </div>
  );
}
