"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CollectButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCollect() {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: collectError } = await supabase.rpc("mark_collected", {
      p_listing_id: listingId,
    });

    if (collectError) {
      setError(collectError.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleCollect}
        disabled={loading}
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 text-base font-medium transition-colors hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        {loading ? "Marking…" : "Mark as collected"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
