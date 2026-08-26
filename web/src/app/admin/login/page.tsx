"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("alphasecondd@gmail.com");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");
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

  async function onMagicSubmit(e: React.FormEvent) {
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
      <p className="mt-2 text-sm text-ink/60">Compte unique alphasecondd@gmail.com — mot de passe ou lien magique.</p>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setMode("password")}
          className={`flex-1 rounded-full border px-4 py-2 text-sm ${mode === "password" ? "bg-ink text-cream border-ink" : "border-ink/15 hover:border-ink"}`}
        >
          Mot de passe
        </button>
        <button
          onClick={() => setMode("magic")}
          className={`flex-1 rounded-full border px-4 py-2 text-sm ${mode === "magic" ? "bg-ink text-cream border-ink" : "border-ink/15 hover:border-ink"}`}
        >
          Lien magique
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={onPasswordSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email-pw" className="text-sm font-medium">Email</label>
            <input
              id="email-pw"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="velmirys/*2003"
              className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <p className="mt-1 text-xs text-ink/60">Pour tester : velmirys/*2003 (compte alphasecondd@gmail.com).</p>
          </div>
          {error && <p role="alert" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-ink py-3 text-sm font-medium text-cream hover:bg-accent disabled:opacity-50">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      ) : sent ? (
        <div className="mt-6 rounded-2xl border border-sand bg-sand/30 p-6">
          <p className="text-sm font-medium">Lien envoyé ✓</p>
          <p className="mt-2 text-sm text-ink/70">Vérifiez votre boîte <span className="font-medium">{email}</span> (et spams) puis cliquez sur le lien.</p>
          <p className="mt-2 text-xs text-ink/60">Le lien expire rapidement. Vous pouvez fermer cette page.</p>
          <button onClick={() => setSent(false)} className="mt-4 text-sm underline hover:text-accent">Renvoyer</button>
        </div>
      ) : (
        <form onSubmit={onMagicSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email-magic" className="text-sm font-medium">Email admin</label>
            <input
              id="email-magic"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <p className="mt-1 text-xs text-ink/60">Seul alphasecondd@gmail.com est autorisé (ADMIN_EMAIL).</p>
          </div>
          {error && <p role="alert" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-ink py-3 text-sm font-medium text-cream hover:bg-accent disabled:opacity-50">
            {loading ? "Envoi…" : "Envoyer le lien magique"}
          </button>
          <p className="text-center text-xs text-ink/60">Rate limit 30s entre 2 envois.</p>
        </form>
      )}
    </div>
  );
}
