import type { Listing } from "./types";

export function formatPrice(listing: Pick<Listing, "is_free" | "price">): string {
  if (listing.is_free) return "Free";
  return `$${Number(listing.price).toFixed(2)}`;
}

export function formatExpiry(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return `Expires in ${minutes}m`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Expires in ${hours}h`;

  const days = Math.round(hours / 24);
  return `Expires in ${days}d`;
}
