"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("alphasecondd@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-serif text-3xl">Admin — Connexion</h1>
      <p className="mt-2 text-sm text-ink/60">
        Connectez-vous avec un email autorisé dans Studio → Réglages du site → Emails administrateurs. Mot de passe uniquement.
      </p>

      <form onSubmit={onPasswordSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email-pw" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email-pw"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink py-3 text-sm font-medium text-cream hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
