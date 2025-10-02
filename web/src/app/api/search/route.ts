import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ stories: [] });

  try {
    const items = await prisma.$queryRawUnsafe<any[]>(
      `
      select id, title, slug, "coverUrl", status, "readsTotal",
             ts_rank(
               to_tsvector('spanish', unaccent(coalesce(title,'') || ' ' || coalesce(description,''))),
               plainto_tsquery('spanish', unaccent($1))
             ) as rank
      from "Story"
      where to_tsvector('spanish', unaccent(coalesce(title,'') || ' ' || coalesce(description,'')))
            @@ plainto_tsquery('spanish', unaccent($1))
      order by rank desc
      limit 20
      `,
      q
    );
    return NextResponse.json({ stories: items });
  } catch (_err) {
    // Fallback para caso FTS não esteja disponível por algum motivo
    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { title: { contains: q!, mode: "insensitive" } },
          { description: { contains: q!, mode: "insensitive" } },
        ],
      },
      take: 20,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ stories });
  }
}


