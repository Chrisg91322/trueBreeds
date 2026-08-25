import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePlatformAdmin();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-semibold">
            TrueBreeds Admin
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground">
              Overview
            </Link>
            <Link href="/admin/tenants" className="hover:text-foreground">
              Tenants
            </Link>
          </nav>
          <Link href="/dashboard" className="ml-auto text-sm text-muted-foreground hover:text-foreground">
            Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
