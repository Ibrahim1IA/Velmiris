import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";
import { getAllowedAdminEmails } from "@/lib/admin";

const ALLOWED = ["en_attente","confirmee","payee","expediee","livree","annulee"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const { status } = await req.json().catch(()=>({})) as { status?: string };
  if (!status || !ALLOWED.includes(status as typeof ALLOWED[number])) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  // Auth — Studio seule source de vérité
  const auth = await createAuthServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const allowedAdminEmails = await getAllowedAdminEmails();
  if (allowedAdminEmails.length > 0 && user.email && !allowedAdminEmails.includes(user.email.toLowerCase().trim())) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("orders").update({ status }).eq("ref", ref);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, ref, status });
}
