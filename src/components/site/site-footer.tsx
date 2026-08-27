import { AtSign, Link2, Mail, Phone, MapPin } from "lucide-react";
import { SiteLink } from "@/components/site/site-base-path";

export function SiteFooter({
  kennelName,
  tagline,
  contactEmail,
  contactPhone,
  address,
  instagramUrl,
  facebookUrl,
  hasAffiliateProducts,
}: {
  kennelName: string;
  tagline?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  hasAffiliateProducts?: boolean;
}) {
  return (
    <footer className="mt-24 border-t site-border site-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <div className="site-font-heading text-xl font-semibold">{kennelName}</div>
          {tagline && <p className="mt-2 max-w-xs text-sm site-muted">{tagline}</p>}
          <div className="mt-4 flex gap-3">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border site-border p-2 transition-opacity hover:opacity-70"
                aria-label="Instagram"
              >
                <AtSign className="h-4 w-4" />
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border site-border p-2 transition-opacity hover:opacity-70"
                aria-label="Facebook"
              >
                <Link2 className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div className="text-sm">
          <div className="mb-3 font-semibold">Explore</div>
          <ul className="space-y-2 site-muted">
            <li><SiteLink href="/our-dogs" className="hover:opacity-80">Our Dogs</SiteLink></li>
            <li><SiteLink href="/available" className="hover:opacity-80">Available Puppies</SiteLink></li>
            <li><SiteLink href="/past-litters" className="hover:opacity-80">Past Litters</SiteLink></li>
            <li><SiteLink href="/testimonials" className="hover:opacity-80">Testimonials</SiteLink></li>
            <li><SiteLink href="/faq" className="hover:opacity-80">FAQ &amp; Policies</SiteLink></li>
            {hasAffiliateProducts && (
              <li><SiteLink href="/recommended" className="hover:opacity-80">What We Recommend</SiteLink></li>
            )}
          </ul>
        </div>

        <div className="text-sm">
          <div className="mb-3 font-semibold">Contact</div>
          <ul className="space-y-2 site-muted">
            {contactEmail && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:opacity-80">{contactEmail}</a>
              </li>
            )}
            {contactPhone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${contactPhone}`} className="hover:opacity-80">{contactPhone}</a>
              </li>
            )}
            {address && (
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t site-border px-5 py-6 text-center text-xs site-muted sm:px-8">
        © {new Date().getFullYear()} {kennelName}. All rights reserved. ·{" "}
        <SiteLink href="/faq" className="underline hover:opacity-80">Policies</SiteLink> · Site by{" "}
        <a href="https://truebreeds.com" className="underline hover:opacity-80">TrueBreeds</a>
      </div>
    </footer>
  );
}
