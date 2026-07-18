import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

// Single, consistent flow: Supabase's PKCE magic link. The browser client
// (lib/supabase/client.ts) defaults to flowType "pkce", so the emailed link
// takes the user to Supabase's own /auth/v1/verify, which then redirects
// here with a `?code=...` param (never a `token_hash`). We exchange that
// code for a session and attach the resulting cookies directly to the
// redirect response — see route-handler.ts for why that matters.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    console.error("[auth/callback] no code param on", request.url);
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  console.log("[auth/callback] code received, exchanging for session");

  const response = NextResponse.redirect(`${origin}/`);
  const supabase = createRouteHandlerClient(request, response);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "[auth/callback] exchangeCodeForSession failed:",
      error.message,
    );
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  console.log(
    "[auth/callback] session established, cookies set on redirect to /",
  );

  return response;
}
