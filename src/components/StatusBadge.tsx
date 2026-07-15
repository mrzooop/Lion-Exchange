import type { Listing } from "@/lib/types";

const STYLES: Record<Listing["computed_status"], string> = {
  available:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  claimed:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  collected:
    "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const LABELS: Record<Listing["computed_status"], string> = {
  available: "Available",
  claimed: "Claimed",
  collected: "Collected",
  expired: "Expired",
};

export function StatusBadge({
  status,
}: {
  status: Listing["computed_status"];
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
