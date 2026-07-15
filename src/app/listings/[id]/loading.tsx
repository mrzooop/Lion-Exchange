export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 animate-pulse px-4 py-4">
      <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-3 h-64 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-4 h-6 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-2 h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-4 h-16 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
    </main>
  );
}
