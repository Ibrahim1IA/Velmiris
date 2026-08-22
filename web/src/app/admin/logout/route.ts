import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth";

export async function POST(req: Request) {
  const supabase = await createAuthServerClient();
  await supabase.auth.signOut();
  const url = new URL("/admin/login", req.url);
  return NextResponse.redirect(url);
}
