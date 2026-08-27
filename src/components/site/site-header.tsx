"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SiteLink } from "@/components/site/site-base-path";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/our-dogs", label: "Our Dogs" },
  { href: "/available", label: "Available" },
  { href: "/past-litters", label: "Past Litters" },
  { href: "/about", label: "About" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  kennelName,
  logoUrl,
  hasAffiliateProducts,
}: {
  kennelName: string;
  logoUrl?: string | null;
  hasAffiliateProducts?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const links = hasAffiliateProducts
    ? [...NAV_LINKS.slice(0, -1), { href: "/recommended", label: "Recommended" }, NAV_LINKS[NAV_LINKS.length - 1]]
    : NAV_LINKS;

  return (
    <header className="site-surface sticky top-0 z-40 border-b site-border backdrop-blur supports-[backdrop-filter]:bg-opacity-90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <SiteLink href="/" className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={kennelName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full site-accent-bg text-sm font-semibold text-white"
              aria-hidden
            >
              {kennelName.slice(0, 1)}
            </span>
          )}
          <span className="site-font-heading max-w-[12rem] truncate text-base font-semibold tracking-tight sm:max-w-none sm:text-lg">
            {kennelName}
          </span>
        </SiteLink>

        <nav className="hidden items-center gap-5 lg:gap-7 md:flex">
          {links.map((link) => (
            <SiteLink
              key={link.label}
              href={link.href}
              className="text-sm font-medium site-muted transition-colors hover:opacity-80"
            >
              {link.label}
            </SiteLink>
          ))}
        </nav>

        <SiteLink
          href="/available"
          className="hidden rounded-full site-accent-bg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] md:inline-block"
        >
          Reserve now
        </SiteLink>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border site-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t site-border px-5 pb-4 md:hidden">
          {links.map((link) => (
            <SiteLink
              key={link.label}
              href={link.href}
              className="rounded-lg px-2 py-2.5 text-sm font-medium site-muted hover:opacity-80"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </SiteLink>
          ))}
          <SiteLink
            href="/available"
            className="mt-2 rounded-full site-accent-bg px-5 py-2.5 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Reserve now
          </SiteLink>
        </nav>
      )}
    </header>
  );
}
