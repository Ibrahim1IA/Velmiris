import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const ALLOWED = ["en_attente","confirmee","payee","expediee","livree","annulee"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const { status } = await req.json().catch(()=>({})) as { status?: string };
  if (!status || !ALLOWED.includes(status as typeof ALLOWED[number])) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  // Auth — Sanity-first, env fallback
  const auth = await createAuthServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  let allowedAdminEmails: string[] = [];
  try {
    const sanity = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" });
    const s = await sanity.fetch<{ adminEmails?: string[] } | null>(`*[_type == "siteSettings"][0]{ adminEmails }`);
    if (s?.adminEmails?.length) allowedAdminEmails = s.adminEmails.filter(Boolean).map((e) => e.toLowerCase());
  } catch {}
  if (allowedAdminEmails.length === 0) {
    const fallback = process.env.ADMIN_EMAIL || process.env.SHOP_EMAIL;
    if (fallback) allowedAdminEmails = [fallback.toLowerCase()];
  }
  {
    const extra = "nimagamoumou@gmail.com";
    if (allowedAdminEmails.length > 0 && !allowedAdminEmails.includes(extra)) allowedAdminEmails = [...allowedAdminEmails, extra];
    else if (allowedAdminEmails.length === 0) allowedAdminEmails = [extra];
    allowedAdminEmails = Array.from(new Set(allowedAdminEmails.map((e) => e.toLowerCase()))).map(
      (l) => allowedAdminEmails.find((o) => o.toLowerCase() === l)!,
    );
  }
  if (allowedAdminEmails.length > 0 && user.email && !allowedAdminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("orders").update({ status }).eq("ref", ref);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, ref, status });
}
