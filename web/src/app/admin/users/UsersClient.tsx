"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminRole = "admin" | "collaborateur";

type UserRow = {
  email: string;
  role: AdminRole | null;
  exists: boolean;
  id: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string | null;
  orphan?: boolean;
};

export default function UsersClient({
  currentUserEmail,
  currentUserRole,
}: {
  currentUserEmail: string;
  currentUserRole: AdminRole;
}) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [orphan, setOrphan] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [confirmPasswords, setConfirmPasswords] = useState<Record<string, string>>({});
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur chargement");
      setUsers(data.users || []);
      setOrphan(data.orphan || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function canManage(target: UserRow) {
    const isSelf = target.email.toLowerCase() === currentUserEmail.toLowerCase();
    if (isSelf) return true; // admin peut gérer son propre compte
    if (target.role === "collaborateur") return true; // admin → collaborateur
    if (target.role === "admin") return false; // admin ne peut pas autre admin
    return false;
  }

  async function handleCreate(email: string) {
    const pw = passwords[email] || "";
    const cpw = confirmPasswords[email] || "";
    if (pw.length < 8) {
      setError("Mot de passe trop court (8 min).");
      return;
    }
    if (pw !== cpw) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setBusyEmail(email);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur création");
      setMsg(`Compte créé pour ${email} ✓`);
      setPasswords((p) => ({ ...p, [email]: "" }));
      setConfirmPasswords((p) => ({ ...p, [email]: "" }));
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusyEmail(null);
    }
  }

  async function handleUpdate(email: string) {
    const pw = passwords[email] || "";
    const cpw = confirmPasswords[email] || "";
    if (pw.length < 8) {
      setError("Mot de passe trop court (8 min).");
      return;
    }
    if (pw !== cpw) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setBusyEmail(email);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur mise à jour");
      setMsg(`Mot de passe mis à jour pour ${email} ✓`);
      setPasswords((p) => ({ ...p, [email]: "" }));
      setConfirmPasswords((p) => ({ ...p, [email]: "" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusyEmail(null);
    }
  }

  async function handleDelete(email: string) {
    if (!confirm(`Supprimer le compte Auth pour ${email} ? (l'email restera dans Studio, mais la connexion sera impossible jusqu'à recréation)`)) return;
    setBusyEmail(email);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur suppression");
      setMsg(`Compte supprimé pour ${email} ✓`);
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusyEmail(null);
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-ink/60">Chargement…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Admin — Accès</h1>
          <p className="mt-1 text-sm text-ink/60">
            Connecté en tant que <span className="font-medium">{currentUserEmail}</span> — rôle{" "}
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${currentUserRole === "admin" ? "bg-ink text-cream" : "bg-sand"}`}>{currentUserRole}</span>
          </p>
          <p className="mt-2 text-sm text-ink/60">
            Source de vérité : <Link href="/studio" className="underline hover:text-accent">Studio → Réglages du site → Utilisateurs admin</Link>. Règle : un admin gère les collaborateurs + son propre mot de passe, jamais celui d&apos;un autre admin.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className="rounded-full border border-ink/15 px-4 py-1.5 text-sm hover:border-ink">
            ← Commandes
          </Link>
          <Link href="/studio" className="rounded-full border border-ink/15 px-4 py-1.5 text-sm hover:border-ink">
            Studio
          </Link>
        </div>
      </div>

      {error && <p role="alert" className="mt-6 rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">{error}</p>}
      {msg && <p role="status" className="mt-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">{msg}</p>}

      <div className="mt-8 rounded-2xl border border-sand overflow-hidden">
        <div className="bg-sand/40 px-4 py-3 flex items-center justify-between">
          <h2 className="font-medium text-sm">Comptes autorisés ({users.length})</h2>
          <button onClick={fetchUsers} className="text-xs underline hover:text-accent">Actualiser</button>
        </div>

        <div className="divide-y divide-sand">
          {users.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-ink/60">Aucun utilisateur. Ajoutez-en dans Studio.</p>
          )}
          {users.map((u) => {
            const manageable = canManage(u);
            const isSelf = u.email.toLowerCase() === currentUserEmail.toLowerCase();
            return (
              <div key={u.email} className="px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-medium flex items-center gap-2">
                    {u.email}
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "admin" ? "bg-ink text-cream" : "bg-amber-100 text-amber-800"}`}>
                      {u.role === "admin" ? "Admin" : "Collaborateur"}
                    </span>
                  </p>
                  <p className="text-xs text-ink/60 mt-1">
                    {u.exists ? (
                      <>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Actif</span>
                        <span className="ml-2">Créé {u.created_at ? new Date(u.created_at).toLocaleString("fr-FR") : "—"}</span>
                        <span className="ml-2">Dernier login {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("fr-FR") : "jamais"}</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">À créer — mot de passe manquant</span>
                    )}
                  </p>
                  {isSelf && <p className="mt-1 text-xs text-ink/50">(vous)</p>}
                  {!manageable && u.role === "admin" && !isSelf && (
                    <p className="mt-1 text-xs text-accent">Vous ne pouvez pas gérer le mot de passe d&apos;un autre admin.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:w-[340px] sm:items-end">
                  {manageable ? (
                    <>
                      <div className="flex flex-col gap-2 w-full">
                        <input
                          type="password"
                          placeholder={u.exists ? "Nouveau mot de passe (8+)" : "Mot de passe initial (8+)"}
                          value={passwords[u.email] || ""}
                          onChange={(e) => setPasswords((p) => ({ ...p, [u.email]: e.target.value }))}
                          className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm outline-none focus:border-ink"
                          autoComplete="new-password"
                        />
                        <input
                          type="password"
                          placeholder="Confirmer le mot de passe"
                          value={confirmPasswords[u.email] || ""}
                          onChange={(e) => setConfirmPasswords((p) => ({ ...p, [u.email]: e.target.value }))}
                          className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm outline-none focus:border-ink"
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="flex gap-2">
                        {u.exists ? (
                          <>
                            <button
                              onClick={() => handleUpdate(u.email)}
                              disabled={!!busyEmail}
                              className="rounded-full bg-ink px-4 py-1.5 text-sm text-cream hover:bg-accent disabled:opacity-50"
                            >
                              {busyEmail === u.email ? "…" : isSelf ? "Changer mon mot de passe" : "Modifier"}
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => handleDelete(u.email)}
                                disabled={!!busyEmail}
                                className="rounded-full border border-accent/30 px-4 py-1.5 text-sm text-accent hover:border-accent disabled:opacity-50"
                              >
                                Supprimer
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => handleCreate(u.email)}
                            disabled={!!busyEmail}
                            className="rounded-full bg-ink px-4 py-1.5 text-sm text-cream hover:bg-accent disabled:opacity-50"
                          >
                            {busyEmail === u.email ? "…" : "Créer le compte"}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-ink/50 italic">Action non autorisée.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {orphan.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <h3 className="text-sm font-medium text-amber-900">Comptes orphelins Supabase (existent en Auth mais plus dans Studio)</h3>
          <p className="mt-1 text-xs text-amber-800">Ces comptes ne peuvent plus se connecter à /admin. Supprimez-les si besoin.</p>
          <ul className="mt-3 space-y-2">
            {orphan.map((o) => (
              <li key={o.email} className="flex items-center justify-between rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm">
                <span className="font-mono text-xs">{o.email}</span>
                <button
                  onClick={() => handleDelete(o.email)}
                  disabled={!!busyEmail}
                  className="rounded-full border border-accent/30 px-3 py-1 text-xs text-accent hover:border-accent"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-sand bg-sand/20 p-4">
        <h3 className="text-sm font-medium">Comment ajouter un utilisateur ?</h3>
        <ol className="mt-2 list-decimal list-inside text-sm text-ink/70 space-y-1">
          <li>Aller dans <Link href="/studio" className="underline">Studio → Réglages du site → Utilisateurs admin</Link>, ajouter l&apos;email + choisir <em>Admin</em> ou <em>Collaborateur</em>, puis Publier.</li>
          <li>Revenir ici, cliquer <em>Actualiser</em>.</li>
          <li>Si collaborateur : saisir mot de passe (8+) et <em>Créer</em>. Si admin : le nouvel admin devra se faire créer son compte par un autre admin ? Un admin ne peut pas créer un autre admin — prévoir bootstrap via `ADMIN_EMAIL` ou intervention manuelle.</li>
          <li>Connexion sur <Link href="/admin/login" className="underline">/admin/login</Link> avec email + mot de passe.</li>
        </ol>
        <p className="mt-3 text-xs text-ink/60">Règles : admin → collaborateurs + soi-même. Collaborateur → rien. Admin → pas autre admin.</p>
      </div>
    </div>
  );
}
