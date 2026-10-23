import Link from "next/link";
import { NewWebsiteForm } from "@/components/admin/new-website-form";

export const dynamic = "force-dynamic";

export default function NewWebsitePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tenants" className="text-sm text-primary hover:underline">
          All tenants
        </Link>
        <h1 className="mt-2 text-xl font-semibold">New website</h1>
        <p className="text-sm text-muted-foreground">
          Creates the site, the owner login, and an active plan, then opens the dashboard so you
          can add photos, text, and pages. The public site stays on preview until you publish it.
        </p>
      </div>
      <NewWebsiteForm />
    </div>
  );
}
