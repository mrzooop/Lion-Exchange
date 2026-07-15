import { Header } from "@/components/Header";
import { ListingCardSkeleton } from "@/components/ListingCardSkeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        <div className="mb-4 h-9 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i}>
              <ListingCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
