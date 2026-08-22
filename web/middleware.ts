import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Protection /admin : laisse passer /admin/login, sinon vérif session via updateSession déjà faite
  // La vérification fine (email === ADMIN_EMAIL) est faite dans les Server Components / API
  // Ici on ne bloque que si aucune session et pas sur login
  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    // On laisse le Server Component gérer la redirection (évite de dupliquer la logique auth ici)
    // Mais on s'assure que les cookies sont frais via updateSession ci-dessus
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
