import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function requireAdmin(req: Request) {
  try {
    console.log("🔐 [AUTH] Verificando autenticação admin...");
    console.log("🔐 [AUTH] ADMIN_TOKEN configurado:", !!process.env.ADMIN_TOKEN);
    console.log("🔐 [AUTH] ADMIN_TOKEN valor:", process.env.ADMIN_TOKEN?.substring(0, 10) + "...");

    // Check for x-admin-token header (for API calls)
    const headerToken = req.headers.get("x-admin-token");
    console.log("🔐 [AUTH] Header token recebido:", headerToken ? headerToken.substring(0, 10) + "..." : "não fornecido");

    if (headerToken && headerToken === process.env.ADMIN_TOKEN) {
      console.log("✅ [AUTH] Autenticado via header token");
      return null;
    }

    // Check for admin_auth cookie (for client-side calls)
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("admin_auth")?.value;
    console.log("🔐 [AUTH] Cookie admin_auth:", authCookie);

    if (authCookie === "ok") {
      console.log("✅ [AUTH] Autenticado via cookie");
      return null;
    }

    console.log("❌ [AUTH] Falha na autenticação - token/cookie inválidos");
    return NextResponse.json({
      error: "unauthorized",
      details: {
        hasHeaderToken: !!headerToken,
        hasCookie: !!authCookie,
        expectedToken: process.env.ADMIN_TOKEN?.substring(0, 10) + "..."
      }
    }, { status: 401 });
  } catch (error) {
    console.error("❌ [AUTH] Erro na autenticação:", error);
    return NextResponse.json({ error: "auth_error", details: String(error) }, { status: 401 });
  }
}

export default requireAdmin;


