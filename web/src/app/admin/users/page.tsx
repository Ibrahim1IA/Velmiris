import { redirect } from "next/navigation";
import Link from "next/link";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { getAdminUsers, getUserRole } from "@/lib/admin";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/admin/login");

  const adminUsers = await getAdminUsers();
  const allowed = adminUsers.map((u) => u.email);
  if (allowed.length > 0 && user.email && !allowed.includes(user.email.toLowerCase().trim())) {
    redirect("/admin");
  }
  const role = await getUserRole(user.email);
  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-serif text-2xl">Accès réservé aux admins</h1>
        <p className="mt-2 text-sm text-ink/60">
          Connecté en tant que {user.email} — rôle : {role ?? "inconnu"}. Seuls les admins peuvent gérer les accès.
        </p>
        <Link href="/admin" className="mt-6 inline-block rounded-full border px-6 py-2 text-sm hover:border-ink">
          Retour commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <UsersClient currentUserEmail={user.email ?? ""} currentUserRole={role} />
    </div>
  );
}
