import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const supabase = createRouteHandlerClient(request, response);

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[auth/signout] signOut failed:", error.message);
  }

  return response;
}
