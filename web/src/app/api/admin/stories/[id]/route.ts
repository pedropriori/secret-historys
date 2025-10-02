import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { StoryBaseSchema } from "@/lib/schemas";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(req); if (unauthorized) return unauthorized;
  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      author: true,
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: { select: { chapters: true } },
    },
  });
  if (!story) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const categories = story.categories.map((sc) => sc.category.name);
  const tags = story.tags.map((st) => st.tag.name);
  return NextResponse.json({ ...story, categories, tags });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(req); if (unauthorized) return unauthorized;
  const { id } = await params;
  const data = StoryBaseSchema.partial().parse(await req.json());

  let authorId: string | undefined;
  if (data.author?.penName) {
    const author = await prisma.author.upsert({ where: { penName: data.author.penName }, update: {}, create: { penName: data.author.penName } });
    authorId = author.id;
  }

  const story = await prisma.story.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description && { description: data.description }),
      ...(data.language && { language: data.language }),
      ...(data.status && { status: data.status as any }),
      ...(data.coverUrl && { coverUrl: data.coverUrl }),
      ...(authorId && { authorId }),
      ...(data.manualRating !== undefined && { manualRating: data.manualRating }),
    },
  });

  // Optional categories/tags update when provided
  if (Array.isArray((data as any).categories)) {
    const names = (data as any).categories as string[];
    await prisma.storyCategory.deleteMany({ where: { storyId: story.id } });
    for (const name of names) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const cat = await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
      await prisma.storyCategory.create({ data: { storyId: story.id, categoryId: cat.id } });
    }
  }
  if (Array.isArray((data as any).tags)) {
    const names = (data as any).tags as string[];
    await prisma.storyTag.deleteMany({ where: { storyId: story.id } });
    for (const name of names) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
      await prisma.storyTag.create({ data: { storyId: story.id, tagId: tag.id } });
    }
  }

  return NextResponse.json({ story });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(req); if (unauthorized) return unauthorized;
  const { id } = await params;

  // Delete related records first to avoid foreign key constraints
  await prisma.storyTag.deleteMany({ where: { storyId: id } });
  await prisma.storyCategory.deleteMany({ where: { storyId: id } });
  await prisma.chapter.deleteMany({ where: { storyId: id } });

  const story = await prisma.story.delete({ where: { id } });
  return NextResponse.json({ ok: true, id: story.id });
}


