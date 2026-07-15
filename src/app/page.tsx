import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/lib/types";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings_view")
    .select("*")
    .eq("computed_status", "available")
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as Listing[];

  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        {error ? (
          <p className="mt-12 text-center text-sm text-red-600">
            Couldn&apos;t load listings.
          </p>
        ) : listings.length === 0 ? (
          <p className="mt-12 text-center text-sm text-neutral-500">
            No listings yet. Check back soon.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {listings.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link
        href="/listings/new"
        className="fixed right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg transition-colors hover:bg-blue-700"
        aria-label="New listing"
      >
        +
      </Link>
    </>
  );
}
