import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PAGE_SIZE = 12 as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const items = await prisma.story.findMany({
    take: PAGE_SIZE + 1,
    orderBy: { id: "desc" },
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    include: {
      categories: { include: { category: true } },
      _count: { select: { chapters: true } }
    }
  });

  let nextCursor: string | null = null;
  if (items.length > PAGE_SIZE) {
    const nextItem = items.pop();
    nextCursor = nextItem ? nextItem.id : null;
  }

  return NextResponse.json({ stories: items, nextCursor });
}


