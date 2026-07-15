"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ClaimButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClaim() {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: claimError } = await supabase.rpc("claim_listing", {
      p_listing_id: listingId,
    });

    if (claimError) {
      setError(claimError.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleClaim}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-3 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Claiming…" : "Claim this item"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
