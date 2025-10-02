import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  return res;
}



