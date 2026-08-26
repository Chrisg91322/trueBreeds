import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/auth";
import { PlatformLogo } from "@/components/site/platform-logo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePlatformAdmin();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
          <PlatformLogo href="/admin" size="sm" />
          <nav className="flex flex-wrap gap-3 text-sm text-muted-foreground sm:gap-4">
            <Link href="/admin" className="hover:text-foreground">
              Overview
            </Link>
            <Link href="/admin/tenants" className="hover:text-foreground">
              Tenants
            </Link>
          </nav>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground sm:ml-auto"
          >
            Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
