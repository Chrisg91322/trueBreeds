import Link from "next/link";
import { Eye } from "lucide-react";

/** Sticky banner shown only on owner-only /preview renders. */
export function SitePreviewBanner() {
  return (
    <div className="sticky top-0 z-50 border-b border-amber-300/80 bg-amber-50 text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-sm sm:px-8">
        <div className="flex items-center gap-2 font-medium">
          <Eye className="h-4 w-4 shrink-0" />
          Preview only — visitors can&apos;t see this until you subscribe and publish.
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <Link href="/onboarding?step=billing" className="underline hover:opacity-80">
            Choose membership
          </Link>
          <Link href="/onboarding?step=publish" className="underline hover:opacity-80">
            Publish
          </Link>
          <Link href="/dashboard" className="underline hover:opacity-80">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
