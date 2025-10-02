import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import AdmZip from "adm-zip";
import { requireAdmin } from "@/lib/admin-auth";
import { processChapterFiles, isValidChapterFile } from "@/lib/chapter-parser";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id: storyId } = await params;

  // Verifica se a obra existe
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { chapters: { select: { number: true } } }
  });

  if (!story) {
    return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo ZIP não fornecido" }, { status: 400 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const zip = new AdmZip(buf);

    // Processa capítulos do ZIP
    const chapterEntries = zip
      .getEntries()
      .filter((e: any) => isValidChapterFile(e.entryName))
      .map((e: any) => ({
        entryName: e.entryName,
        content: zip.readAsText(e)
      }));

    if (chapterEntries.length === 0) {
      return NextResponse.json({ error: "Nenhum capítulo encontrado no ZIP" }, { status: 400 });
    }

    const chapters = processChapterFiles(chapterEntries);

    // Verifica se há conflitos de numeração
    const existingNumbers = new Set(story.chapters.map(c => c.number));
    const newNumbers = chapters.map(c => c.number);
    const conflicts = newNumbers.filter(num => existingNumbers.has(num));

    if (conflicts.length > 0) {
      return NextResponse.json({
        error: "Conflito de numeração",
        detail: `Os capítulos ${conflicts.join(", ")} já existem nesta obra`,
        conflicts
      }, { status: 400 });
    }

    // Cria os capítulos no banco de dados
    await prisma.$transaction(
      chapters.map((chapter) =>
        prisma.chapter.create({
          data: {
            storyId: story.id,
            number: chapter.number,
            title: chapter.title,
            contentMd: chapter.content,
            lengthChars: chapter.content.length,
            isPublished: true
          },
        })
      ),
    );

    return NextResponse.json({
      ok: true,
      storyId: story.id,
      storyTitle: story.title,
      chaptersAdded: chapters.length,
      chapters: chapters.map(c => ({ number: c.number, title: c.title }))
    });

  } catch (err: any) {
    console.error("Erro na importação de capítulos:", err);
    return NextResponse.json({
      error: "import_failed",
      detail: String(err?.message || err)
    }, { status: 400 });
  }
}