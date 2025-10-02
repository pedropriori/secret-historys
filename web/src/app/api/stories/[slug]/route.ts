import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await prisma.story.findUnique({
    where: { slug },
    include: { author: true },
  });
  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ story });
}



