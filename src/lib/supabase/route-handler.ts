import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// For Route Handlers that must both read the incoming session and WRITE a
// new one (auth callback, sign-out) — as opposed to lib/supabase/server.ts,
// which is read-mostly and relies on next/headers' cookies() being merged
// into whatever Response a handler returns. That merge is not guaranteed
// for a separately-constructed NextResponse.redirect(): a Set-Cookie header
// written that way can silently fail to reach the browser, which is what
// caused new sessions to never actually get persisted after the magic-link
// exchange. Binding cookie writes directly to the exact response object
// being returned removes that ambiguity — the same pattern already used in
// lib/supabase/middleware.ts.
export function createRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
}
