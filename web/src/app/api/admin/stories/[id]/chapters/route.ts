import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(req); if (unauthorized) return unauthorized;
  const { id } = await params;

  try {
    const chapters = await prisma.chapter.findMany({
      where: { storyId: id },
      orderBy: { number: "asc" },
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar capítulos" }, { status: 500 });
  }
}
