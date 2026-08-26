"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PlatformLogo } from "@/components/site/platform-logo";
import { DashboardNavLinks } from "@/components/dashboard/sidebar";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function DashboardTopbar({
  title,
  email,
  kennelName,
  siteUrl,
}: {
  title: string;
  email: string;
  kennelName: string;
  siteUrl: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-3 sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className="rounded-md p-2 hover:bg-muted md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(20rem,88vw)] bg-sidebar p-0">
            <SheetHeader className="border-b px-3 py-3 text-left">
              <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
              <PlatformLogo href="/dashboard" size="sm" />
            </SheetHeader>
            <DashboardNavLinks onNavigate={() => setMenuOpen(false)} />
            <div className="border-t p-4">
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent"
                onClick={() => setMenuOpen(false)}
              >
                View live site
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-tight sm:text-lg">{title}</h1>
          <p className="truncate text-xs text-muted-foreground">{kennelName}</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex shrink-0 items-center gap-2 rounded-full outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{email.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="max-w-[14rem] truncate px-2 py-1.5 text-sm font-medium">{email}</div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
