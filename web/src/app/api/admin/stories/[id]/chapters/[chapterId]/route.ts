import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  const unauthorized = await requireAdmin(req); if (unauthorized) return unauthorized;
  const { id, chapterId } = await params;

  try {
    await prisma.chapter.delete({
      where: {
        id: chapterId,
        storyId: id // Ensure chapter belongs to the story
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir capítulo" }, { status: 500 });
  }
}
