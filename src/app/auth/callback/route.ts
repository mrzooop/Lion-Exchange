import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

// Supabase's hosted /auth/v1/verify redirects here in one of two shapes,
// and which one you get depends on the flow, not on our own code:
//   - OAuth / third-party sign-in: `?code=...` -> exchangeCodeForSession
//   - Email link (magic link, signup confirm, invite, recovery, etc.):
//     `?token_hash=...&type=...` -> verifyOtp
// This app only uses email magic links, so token_hash is the real path in
// production; code is kept as a fallback for forward-compatibility (e.g. if
// an OAuth provider is ever added) and is never used at the same time as
// token_hash.
const VALID_EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && (VALID_EMAIL_OTP_TYPES as string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  // Never log the param values themselves (token_hash/code are one-time
  // secrets) — only which ones were present.
  console.log(
    "[auth/callback] params received:",
    JSON.stringify({
      has_token_hash: tokenHash !== null,
      type: type ?? null,
      has_code: code !== null,
    }),
  );

  if (tokenHash && isEmailOtpType(type)) {
    const response = NextResponse.redirect(`${origin}/`);
    const supabase = createRouteHandlerClient(request, response);

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      console.error("[auth/callback] verifyOtp failed:", error.message);
      return NextResponse.redirect(`${origin}/login?error=verify_failed`);
    }

    console.log("[auth/callback] verifyOtp succeeded, session cookies set");
    return response;
  }

  if (tokenHash && !isEmailOtpType(type)) {
    console.error("[auth/callback] token_hash present but type is invalid:", type);
    return NextResponse.redirect(`${origin}/login?error=invalid_type`);
  }

  if (code) {
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
      "[auth/callback] exchangeCodeForSession succeeded, session cookies set",
    );
    return response;
  }

  console.error("[auth/callback] neither token_hash+type nor code present");
  return NextResponse.redirect(`${origin}/login?error=missing_params`);
}
