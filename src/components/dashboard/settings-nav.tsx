"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/settings", label: "General", exact: true },
  { href: "/dashboard/settings/theme", label: "Theme" },
  { href: "/dashboard/settings/contact", label: "Contact & About" },
  { href: "/dashboard/settings/policies", label: "Policies" },
  { href: "/dashboard/settings/payments", label: "Payments" },
  { href: "/dashboard/settings/billing", label: "Billing" },
  { href: "/dashboard/settings/domain", label: "Domain" },
  { href: "/dashboard/settings/team", label: "Team" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto border-b pb-px">
      {TABS.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
