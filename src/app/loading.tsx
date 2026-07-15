import { Header } from "@/components/Header";
import { ListingCardSkeleton } from "@/components/ListingCardSkeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <ListingCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
