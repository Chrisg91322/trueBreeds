const LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  available: "Available",
  deposit_received: "Deposit Received",
  reserved: "Reserved",
  sold: "Sold",
  kept: "Kept by Breeder",
  planned: "Planned",
  expecting: "Expecting",
  born: "Born",
  active: "Active",
  complete: "Complete",
};

const STYLES: Record<string, string> = {
  upcoming: "bg-amber-100 text-amber-900",
  available: "bg-emerald-100 text-emerald-900",
  deposit_received: "bg-sky-100 text-sky-900",
  reserved: "bg-violet-100 text-violet-900",
  sold: "bg-neutral-200 text-neutral-700",
  kept: "bg-neutral-200 text-neutral-700",
  planned: "bg-amber-100 text-amber-900",
  expecting: "bg-sky-100 text-sky-900",
  born: "bg-emerald-100 text-emerald-900",
  active: "bg-emerald-100 text-emerald-900",
  complete: "bg-neutral-200 text-neutral-700",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        STYLES[status] ?? "bg-neutral-100 text-neutral-800"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
