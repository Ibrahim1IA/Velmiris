import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export type AdminRole = "admin" | "collaborateur";
export type AdminUser = { email: string; role: AdminRole };

// Normalise email
function norm(email: string) {
  return email.toLowerCase().trim();
}

// Source unique de vérité : Sanity siteSettings.adminUsers, fallback adminEmails (legacy), fallback env
export async function getAdminUsers(): Promise<AdminUser[]> {
  let users: AdminUser[] = [];
  try {
    const sanity = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: "published",
    });
    const s = await sanity.fetch<{
      adminUsers?: { email?: string; role?: string }[] | null;
      adminEmails?: string[] | null;
    } | null>(`*[_type == "siteSettings"][0]{ adminUsers[]{email, role}, adminEmails }`);

    if (s?.adminUsers?.length) {
      users = s.adminUsers
        .filter((u) => u.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email))
        .map((u) => ({
          email: norm(u.email!),
          role: u.role === "admin" ? "admin" : "collaborateur",
        }));
      // dedupe keep first
      const seen = new Set<string>();
      users = users.filter((u) => {
        if (seen.has(u.email)) return false;
        seen.add(u.email);
        return true;
      });
    } else if (s?.adminEmails?.length) {
      // Legacy: tout en admin pour ne pas casser droits existants
      const emails = s.adminEmails.filter(Boolean).map(norm);
      const uniq = Array.from(new Set(emails));
      users = uniq.map((email) => ({ email, role: "admin" as const }));
    }
  } catch {
    // ignore
  }
  if (users.length === 0) {
    const fallback = process.env.ADMIN_EMAIL || process.env.SHOP_EMAIL;
    if (fallback && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fallback)) {
      users = [{ email: norm(fallback), role: "admin" }];
    }
  }
  return users;
}

export async function getAllowedAdminEmails(): Promise<string[]> {
  const users = await getAdminUsers();
  return users.map((u) => u.email);
}

export async function getUserRole(email: string | null | undefined): Promise<AdminRole | null> {
  if (!email) return null;
  const users = await getAdminUsers();
  const found = users.find((u) => u.email === norm(email));
  return found?.role ?? null;
}

export async function isAllowedAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const allowed = await getAllowedAdminEmails();
  return allowed.includes(norm(email));
}

export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  const role = await getUserRole(email);
  return role === "admin";
}

// Règle métier :
// - admin peut gérer (créer/modifier/supprimer) les collaborateurs
// - admin peut gérer son propre compte
// - admin NE peut PAS gérer un autre admin
// - collaborateur ne peut rien gérer
export async function canManagePassword(
  callerEmail: string | null | undefined,
  targetEmail: string | null | undefined
): Promise<{ ok: boolean; reason?: string }> {
  if (!callerEmail || !targetEmail) return { ok: false, reason: "Email manquant." };
  const caller = norm(callerEmail);
  const target = norm(targetEmail);
  const callerRole = await getUserRole(caller);
  const targetRole = await getUserRole(target);

  if (callerRole !== "admin") {
    return { ok: false, reason: "Seul un admin peut gérer les mots de passe." };
  }
  if (!targetRole) {
    // cible pas dans Studio → refus, doit être ajouté d'abord
    return { ok: false, reason: "Cet email n'est pas dans Studio (adminUsers)." };
  }
  if (caller === target) {
    // self-service admin autorisé
    return { ok: true };
  }
  if (targetRole === "admin") {
    return { ok: false, reason: "Un admin ne peut pas modifier le mot de passe d'un autre admin." };
  }
  // caller admin, target collaborateur
  if (targetRole === "collaborateur") return { ok: true };
  return { ok: false, reason: "Action non autorisée." };
}
