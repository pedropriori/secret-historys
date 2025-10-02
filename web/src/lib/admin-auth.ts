import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function requireAdmin(req: Request) {
  // Check for x-admin-token header (for API calls)
  const headerToken = (req.headers as any).get?.("x-admin-token") ?? req.headers.get("x-admin-token");
  if (headerToken === process.env.ADMIN_TOKEN) {
    return null;
  }

  // Check for admin_auth cookie (for client-side calls)
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth")?.value;
  if (authCookie === "ok") {
    return null;
  }

  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export default requireAdmin;


