import { NextResponse } from "next/server";
import { uploadCoverFromBuffer } from "@/lib/storage";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const unauthorized = await requireAdmin(req); if (unauthorized) return unauthorized;
  const form = await req.formData();
  const slug = String(form.get("slug") || "");
  const file = form.get("file") as File | null;
  if (!slug || !file) return NextResponse.json({ error: "missing slug or file" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const url = await uploadCoverFromBuffer(slug, buf, file.type || "image/jpeg");
  return NextResponse.json({ url });
}


