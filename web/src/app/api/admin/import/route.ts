import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import AdmZip from "adm-zip";
import crypto from "crypto";
import { StoryImportSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadCoverFromBuffer } from "@/lib/storage";
import { createSlug } from "@/lib/slug";
import { processChapterFiles, isValidChapterFile } from "@/lib/chapter-parser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const unauthorized = await requireAdmin(req); if (unauthorized) return unauthorized;
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "ZIP faltando" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const checksum = crypto.createHash("sha1").update(buf).digest("hex");

  const existing = await prisma.importJob.findUnique({ where: { checksum } });
  if (existing?.status === "DONE") return NextResponse.json({ ok: true, reused: true, storyId: existing.storyId });

  const job = await prisma.importJob.create({ data: { checksum, status: "PENDING" } });

  try {
    const zip = new AdmZip(buf);
    const storyJsonEntry = zip.getEntry("story.json");
    if (!storyJsonEntry) throw new Error("story.json não encontrado");
    const rawJson = zip.readAsText(storyJsonEntry);
    const meta = StoryImportSchema.parse(JSON.parse(rawJson));

    // Gera slug automaticamente se não fornecido
    const slug = meta.slug || createSlug(meta.title);

    let coverUrl: string | undefined = undefined;
    if (meta.coverFile && zip.getEntry(meta.coverFile)) {
      const cbuf = zip.readFile(meta.coverFile)!;
      coverUrl = await uploadCoverFromBuffer(slug, Buffer.from(cbuf), "image/jpeg");
    }

    const author = await prisma.author.upsert({ where: { penName: meta.author.penName }, update: {}, create: { penName: meta.author.penName } });

    const story = await prisma.story.create({
      data: {
        title: meta.title,
        slug: slug,
        description: meta.description,
        language: meta.language,
        status: meta.status as any,
        coverUrl,
        authorId: author.id,
      },
    });

    for (const name of meta.categories ?? []) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const cat = await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
      await prisma.storyCategory.create({ data: { storyId: story.id, categoryId: cat.id } });
    }
    for (const name of meta.tags ?? []) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
      await prisma.storyTag.create({ data: { storyId: story.id, tagId: tag.id } });
    }

    // Processa capítulos com o novo parser
    const chapterEntries = zip
      .getEntries()
      .filter((e) => isValidChapterFile(e.entryName))
      .map((e) => ({
        entryName: e.entryName,
        content: zip.readAsText(e)
      }));

    const chapters = processChapterFiles(chapterEntries);

    // Cria capítulos no banco de dados
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

    await prisma.importJob.update({ where: { id: job.id }, data: { status: "DONE", storyId: story.id } });
    return NextResponse.json({ ok: true, storyId: story.id, chapters: chapters.length });
  } catch (err: any) {
    await prisma.importJob.update({ where: { id: job.id }, data: { status: "ERROR", message: String(err?.message || err) } });
    return NextResponse.json({ error: "import_failed", detail: String(err?.message || err) }, { status: 400 });
  }
}


