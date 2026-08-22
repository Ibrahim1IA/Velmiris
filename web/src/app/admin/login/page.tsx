"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("alphasecondd@gmail.com");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur envoi lien.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-serif text-3xl">Admin — Connexion</h1>
      <p className="mt-2 text-sm text-ink/60">Lien magique envoyé à votre email (PRD §8.5, compte unique).</p>
      {sent ? (
        <div className="mt-6 rounded-2xl border border-sand bg-sand/30 p-6">
          <p className="text-sm font-medium">Lien envoyé ✓</p>
          <p className="mt-2 text-sm text-ink/70">Vérifiez votre boîte <span className="font-medium">{email}</span> (et spams) puis cliquez sur le lien.</p>
          <p className="mt-2 text-xs text-ink/50">Le lien expire rapidement. Vous pouvez fermer cette page.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">Email admin</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <p className="mt-1 text-xs text-ink/50">Seul alphasecondd@gmail.com est autorisé (ADMIN_EMAIL).</p>
          </div>
          {error && <p role="alert" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-ink py-3 text-sm font-medium text-cream hover:bg-accent disabled:opacity-50">
            {loading ? "Envoi…" : "Envoyer le lien magique"}
          </button>
        </form>
      )}
    </div>
  );
}
