import { ShieldAlert } from "lucide-react";
import { stopImpersonation } from "@/lib/actions/admin";

export function ImpersonationBanner({ kennelName }: { kennelName: string }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        Viewing <strong>{kennelName}</strong>&apos;s dashboard as a platform admin
      </div>
      <form action={stopImpersonation}>
        <button type="submit" className="underline hover:no-underline">
          Exit
        </button>
      </form>
    </div>
  );
}
