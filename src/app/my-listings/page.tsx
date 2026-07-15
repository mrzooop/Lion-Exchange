import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/lib/types";

type Tab = "created" | "claimed";

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab: Tab = tabParam === "claimed" ? "claimed" : "created";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const column = tab === "created" ? "owner_id" : "claimed_by";
  const { data } = user
    ? await supabase
        .from("listings_view")
        .select("*")
        .eq(column, user.id)
        .order("created_at", { ascending: false })
    : { data: null };

  const listings = (data ?? []) as Listing[];

  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        <div className="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-900">
          <Link
            href="/my-listings?tab=created"
            className={`flex-1 rounded-md py-1.5 text-center text-sm font-medium transition-colors ${
              tab === "created"
                ? "bg-white shadow dark:bg-neutral-800"
                : "text-neutral-500"
            }`}
          >
            Created
          </Link>
          <Link
            href="/my-listings?tab=claimed"
            className={`flex-1 rounded-md py-1.5 text-center text-sm font-medium transition-colors ${
              tab === "claimed"
                ? "bg-white shadow dark:bg-neutral-800"
                : "text-neutral-500"
            }`}
          >
            Claimed
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className="mt-12 text-center text-sm text-neutral-500">
            {tab === "created"
              ? "You haven't posted any listings yet."
              : "You haven't claimed any listings yet."}
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
    </>
  );
}
