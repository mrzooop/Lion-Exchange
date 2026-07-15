export function ListingCardSkeleton() {
  return (
    <div className="flex animate-pulse gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="h-20 w-20 shrink-0 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}
