"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ListingCategory } from "@/lib/types";

const CATEGORIES: { value: ListingCategory; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "groceries", label: "Groceries" },
  { value: "household", label: "Household" },
];

function nowLocalDatetimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function NewListingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ListingCategory>("food");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [pickupLocation, setPickupLocation] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!photoFile) {
      setError("Please add a photo.");
      return;
    }
    if (!isFree && !price) {
      setError("Enter a price, or mark this item as free.");
      return;
    }
    if (!expiresAt) {
      setError("Set when this listing should expire.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setSubmitting(false);
      return;
    }

    const fileExt = photoFile.name.split(".").pop() ?? "jpg";
    const photoPath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-photos")
      .upload(photoPath, photoFile);

    if (uploadError) {
      setError(uploadError.message);
      setSubmitting(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("listing-photos").getPublicUrl(photoPath);

    const { error: insertError } = await supabase.from("listings").insert({
      owner_id: user.id,
      title,
      description,
      category,
      is_free: isFree,
      price: isFree ? null : Number(price),
      quantity: Number(quantity),
      photo_url: publicUrl,
      pickup_location: pickupLocation,
      expires_at: new Date(expiresAt).toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold">New listing</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="photo">
            Photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          {photoPreview && (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img
              src={photoPreview}
              alt="Preview"
              className="mt-2 h-40 w-full rounded-lg object-cover"
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ListingCategory)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isFree"
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="isFree" className="text-sm font-medium">
            This item is free
          </label>
        </div>

        {!isFree && (
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="price">
              Price ($)
            </label>
            <input
              id="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required={!isFree}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="quantity">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="pickupLocation"
          >
            Pickup location
          </label>
          <input
            id="pickupLocation"
            required
            placeholder="e.g. Wien Hall lobby"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="expiresAt">
            Expires
          </label>
          <input
            id="expiresAt"
            type="datetime-local"
            required
            min={nowLocalDatetimeValue()}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 px-3 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post listing"}
        </button>
      </form>
    </main>
  );
}
