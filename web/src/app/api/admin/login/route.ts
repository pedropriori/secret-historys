import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("🔐 [LOGIN] Iniciando processo de login admin...");
    const { token } = await req.json();
    console.log("🔐 [LOGIN] Token recebido:", token ? token.substring(0, 10) + "..." : "não fornecido");
    console.log("🔐 [LOGIN] Token esperado:", process.env.ADMIN_TOKEN?.substring(0, 10) + "...");

    if (token !== process.env.ADMIN_TOKEN) {
      console.log("❌ [LOGIN] Token inválido");
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }

    console.log("✅ [LOGIN] Token válido, criando cookie...");
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_auth", "ok", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    console.log("✅ [LOGIN] Cookie definido com sucesso");
    return res;
  } catch (error) {
    console.error("❌ [LOGIN] Erro no login:", error);
    return NextResponse.json({ error: "login_error", details: String(error) }, { status: 500 });
  }
}




