export type ListingCategory = "food" | "groceries" | "household";
export type ListingStatus = "available" | "claimed" | "collected" | "expired";

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: ListingCategory;
  is_free: boolean;
  price: number | null;
  quantity: number;
  photo_url: string | null;
  pickup_location: string;
  expires_at: string;
  status: ListingStatus;
  claimed_by: string | null;
  claimed_at: string | null;
  collected_at: string | null;
  created_at: string;
  computed_status: ListingStatus;
}
