import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { ClaimButton } from "@/components/ClaimButton";
import { CollectButton } from "@/components/CollectButton";
import type { Listing } from "@/lib/types";
import { formatExpiry, formatPrice } from "@/lib/format";

const CATEGORY_LABEL: Record<Listing["category"], string> = {
  food: "Food",
  groceries: "Groceries",
  household: "Household",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: listing }, { data: userData }] = await Promise.all([
    supabase.from("listings_view").select("*").eq("id", id).maybeSingle<Listing>(),
    supabase.auth.getUser(),
  ]);

  if (!listing) {
    notFound();
  }

  const currentUserId = userData.user?.id;
  const isOwner = currentUserId === listing.owner_id;
  const isClaimant = currentUserId === listing.claimed_by;
  const canClaim = listing.computed_status === "available" && !isOwner;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-4">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← Back
      </Link>

      <div className="mt-3 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        {listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL
          <img
            src={listing.photo_url}
            alt={listing.title}
            className="h-64 w-full object-cover"
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center text-5xl">
            📦
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <h1 className="text-xl font-semibold">{listing.title}</h1>
        <span className="shrink-0 text-lg font-semibold text-blue-600">
          {formatPrice(listing)}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
        <span>{CATEGORY_LABEL[listing.category]}</span>
        <span>·</span>
        <span>Qty {listing.quantity}</span>
        <span>·</span>
        <StatusBadge status={listing.computed_status} />
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm">{listing.description}</p>

      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Pickup location</dt>
          <dd className="text-right">{listing.pickup_location}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Expires</dt>
          <dd className="text-right">{formatExpiry(listing.expires_at)}</dd>
        </div>
      </dl>

      {canClaim && <ClaimButton listingId={listing.id} />}

      {listing.computed_status === "claimed" && (isClaimant || isOwner) && (
        <>
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            {isClaimant
              ? "You claimed this item. Coordinate pickup at the listed location."
              : "This item has been claimed."}
          </p>
          <CollectButton listingId={listing.id} />
        </>
      )}
    </main>
  );
}
