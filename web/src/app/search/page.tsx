import StoryCard from "@/components/shared/StoryCard";
import { prisma } from "@/lib/prisma";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let stories: any[] = [];
  if (q) {
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
      stories = items ?? [];
    } catch (_err) {
      stories = await prisma.story.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 20,
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Buscar</h1>
      {q ? (
        <p className="text-sm text-neutral-600">Resultados para “{q}”</p>
      ) : (
        <p className="text-sm text-neutral-600">Escribe una palabra clave.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stories.map((s) => (
          <StoryCard key={s.id} story={s} />
        ))}
      </div>
    </div>
  );
}


