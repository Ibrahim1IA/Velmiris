import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client SSR pour Auth (cookies) — utilisé dans Server Components / Route Handlers / Middleware
export async function createAuthServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase auth: URL / PUBLISHABLE_KEY manquants");
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // ignore when called from Server Component (read-only)
          }
        }
      },
    },
  });
}
