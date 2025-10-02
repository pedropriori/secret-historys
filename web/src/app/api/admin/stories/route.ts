import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { StoryBaseSchema } from "@/lib/schemas";

export async function GET(req: Request) {
  const unauthorized = await requireAdmin(req); if (unauthorized) return unauthorized;
  const { searchParams } = new URL(req.url);
  const take = Number(searchParams.get("take") || 20);
  const cursor = searchParams.get("cursor") || undefined;
  const status = searchParams.get("status") || undefined;
  const query = searchParams.get("query")?.trim();

  const where: any = {};
  if (status) where.status = status as any;
  if (query) where.OR = [
    { title: { contains: query, mode: "insensitive" } },
    { slug: { contains: query, mode: "insensitive" } },
  ];

  const items = await prisma.story.findMany({
    where,
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { updatedAt: "desc" },
    include: { author: true, _count: { select: { chapters: true } } },
  });
  const nextCursor = items.length === take ? items[items.length - 1].id : null;
  return NextResponse.json({ items, nextCursor });
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin(req); if (unauthorized) return unauthorized;
  const data = StoryBaseSchema.parse(await req.json());

  const author = await prisma.author.upsert({
    where: { penName: data.author.penName },
    update: {},
    create: { penName: data.author.penName },
  });

  const story = await prisma.story.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      language: data.language,
      status: data.status as any,
      coverUrl: data.coverUrl,
      authorId: author.id,
      manualRating: data.manualRating,
    },
  });

  for (const name of data.categories) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const cat = await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
    await prisma.storyCategory.create({ data: { storyId: story.id, categoryId: cat.id } });
  }
  for (const name of data.tags) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
    await prisma.storyTag.create({ data: { storyId: story.id, tagId: tag.id } });
  }

  return NextResponse.json({ story });
}


