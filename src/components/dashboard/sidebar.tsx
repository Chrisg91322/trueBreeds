"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  Heart,
  Users,
  ListTree,
  DollarSign,
  ShoppingBag,
  Share2,
  BarChart3,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV_SECTIONS: { label?: string; items: NavItem[] }[] = [
  {
    items: [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Kennel",
    items: [
      { href: "/dashboard/animals", label: "Our Dogs", icon: PawPrint },
      { href: "/dashboard/litters", label: "Litters", icon: Heart },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/dashboard/leads", label: "Leads (CRM)", icon: Users },
      { href: "/dashboard/waitlist", label: "Waitlist", icon: ListTree },
      { href: "/dashboard/deposits", label: "Deposits", icon: DollarSign },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/dashboard/affiliate", label: "Amazon Picks", icon: ShoppingBag },
      { href: "/dashboard/social", label: "Social", icon: Share2 },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    items: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }],
  },
];

export function DashboardSidebar({ siteUrl }: { siteUrl: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          B
        </span>
        <span className="font-semibold">TrueBreeds</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i}>
            {section.label && (
              <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-4">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent"
        >
          View live site
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </aside>
  );
}
