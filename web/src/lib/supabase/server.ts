import { createClient } from "@supabase/supabase-js";

// Client serveur (secret key) — jamais importé côté client — PRD §9.2
export function createServerClient() {
  const url = process.env.SUPABASE_PROJECT_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key || url === "TODO") {
    throw new Error(
      "Supabase non configuré : renseigner SUPABASE_PROJECT_URL et SUPABASE_SECRET_KEY dans .env.local",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
