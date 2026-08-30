import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";
import { getAdminUsers, getUserRole, canManagePassword } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user || !user.email) {
    return { error: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) as NextResponse, user: null };
  }
  const role = await getUserRole(user.email);
  // Vérifie que l'email est bien dans la liste autorisée (admin ou collaborateur)
  const adminUsers = await getAdminUsers();
  const allowedEmails = adminUsers.map((u) => u.email);
  if (allowedEmails.length > 0 && !allowedEmails.includes(user.email.toLowerCase().trim())) {
    return { error: NextResponse.json({ error: "Accès refusé." }, { status: 403 }) as NextResponse, user };
  }
  return { error: null as NextResponse | null, user, role, adminUsers };
}

// GET — liste les admins (emails + rôles + état Supabase Auth) — réservé aux admins
export async function GET() {
  const { error, user, role, adminUsers } = await requireAuth();
  if (error) return error;
  if (role !== "admin") {
    return NextResponse.json({ error: "Réservé aux admins." }, { status: 403 });
  }

  const supabaseAdmin = createServerClient();
  const { data, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }
  const usersByEmail = new Map((data.users || []).map((u) => [u.email?.toLowerCase().trim(), u]));

  const allowed = adminUsers!.map((u) => u.email);
  const rolesByEmail = new Map(adminUsers!.map((u) => [u.email, u.role]));

  const result = allowed.map((email) => {
    const u = usersByEmail.get(email);
    return {
      email,
      role: rolesByEmail.get(email) ?? "collaborateur",
      exists: !!u,
      id: u?.id ?? null,
      email_confirmed_at: u?.email_confirmed_at ?? null,
      last_sign_in_at: u?.last_sign_in_at ?? null,
      created_at: u?.created_at ?? null,
    };
  });

  const orphan = (data.users || [])
    .filter((u) => u.email && !allowed.includes(u.email.toLowerCase().trim()))
    .map((u) => ({
      email: u.email!,
      role: null,
      exists: true,
      id: u.id,
      email_confirmed_at: u.email_confirmed_at,
      last_sign_in_at: u.last_sign_in_at,
      created_at: u.created_at,
      orphan: true as const,
    }));

  return NextResponse.json({ allowed, users: result, orphan, currentRole: role, currentEmail: user!.email });
}

// POST — créer un utilisateur pour un email déjà autorisé dans Studio (admin → collaborateur uniquement, ou self)
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = body.email?.toLowerCase().trim();
  const password = body.password;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Mot de passe trop court (8 caractères min)." }, { status: 400 });
  }

  const check = await canManagePassword(user!.email!, email);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason || "Action non autorisée." }, { status: 403 });
  }

  const supabaseAdmin = createServerClient();
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) {
    const msg = createErr.message || "Erreur création utilisateur.";
    const status = msg.toLowerCase().includes("already") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
  return NextResponse.json({ ok: true, user: { id: created.user.id, email: created.user.email } });
}

// PATCH — modifier le mot de passe (admin → collaborateur ou self admin)
export async function PATCH(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = body.email?.toLowerCase().trim();
  const password = body.password;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Mot de passe trop court (8 caractères min)." }, { status: 400 });
  }

  const check = await canManagePassword(user!.email!, email);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason || "Action non autorisée." }, { status: 403 });
  }

  const supabaseAdmin = createServerClient();
  const { data: listed } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const target = listed?.users?.find((u) => u.email?.toLowerCase().trim() === email);
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable. Créez-le d'abord." }, { status: 404 });
  }

  const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(target.id, { password });
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE — supprimer l'utilisateur Auth (admin → collaborateur uniquement). Orphelins autorisés pour admin.
export async function DELETE(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: "Email requis." }, { status: 400 });

  if (email === user!.email!.toLowerCase().trim()) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 403 });
  }

  const adminUsers = await getAdminUsers();
  const isOrphan = !adminUsers.some((u) => u.email === email);
  if (isOrphan) {
    const callerRole = await getUserRole(user!.email!);
    if (callerRole !== "admin") return NextResponse.json({ error: "Réservé aux admins." }, { status: 403 });
  } else {
    const check = await canManagePassword(user!.email!, email);
    if (!check.ok) {
      return NextResponse.json({ error: check.reason || "Action non autorisée." }, { status: 403 });
    }
  }

  const supabaseAdmin = createServerClient();
  const { data: listed } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const target = listed?.users?.find((u) => u.email?.toLowerCase().trim() === email);
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(target.id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
