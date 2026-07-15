import Link from "next/link";
import type { Listing } from "@/lib/types";
import { formatExpiry, formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

const CATEGORY_LABEL: Record<Listing["category"], string> = {
  food: "Food",
  groceries: "Groceries",
  household: "Household",
};

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex gap-3 rounded-xl border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URLs; skip next/image config for now
          <img
            src={listing.photo_url}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            📦
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="truncate font-medium">{listing.title}</h2>
          <span className="shrink-0 text-sm font-medium text-blue-600">
            {formatPrice(listing)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">
          {CATEGORY_LABEL[listing.category]} · {listing.pickup_location}
        </p>
        {listing.computed_status === "available" ? (
          <p className="mt-1 text-xs text-neutral-400">
            {formatExpiry(listing.expires_at)}
          </p>
        ) : (
          <div className="mt-1">
            <StatusBadge status={listing.computed_status} />
          </div>
        )}
      </div>
    </Link>
  );
}
