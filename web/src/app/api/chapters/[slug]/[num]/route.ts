import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string; num: string }> }
) {
  const { slug, num } = await params;
  const story = await prisma.story.findUnique({ where: { slug } });
  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const number = Number(num);
  const chapter = await prisma.chapter.findUnique({
    where: { storyId_number: { storyId: story.id, number } },
  });

  if (!chapter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ chapter });
}



