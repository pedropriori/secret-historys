import { prisma } from "@/lib/prisma";
import StoryCard from "@/components/shared/StoryCard";

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ cursor?: string }> }) {
  const { slug } = await params;
  const { cursor } = await searchParams;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;

  const take = 24;
  const edges = await prisma.storyCategory.findMany({
    where: { categoryId: category.id },
    take: take + 1,
    cursor: cursor ? { storyId_categoryId: { storyId: cursor, categoryId: category.id } } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { storyId: "desc" },
    include: {
      story: {
        include: {
          categories: { include: { category: true } },
          _count: { select: { chapters: true } }
        }
      }
    },
  });
  let nextCursor: string | null = null;
  if (edges.length > take) {
    const next = edges.pop();
    nextCursor = next ? next.storyId : null;
  }
  const stories = edges.map((e) => e.story);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categoría: {category.name}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stories.map((s) => (
          <StoryCard key={s.id} story={s} />
        ))}
      </div>

      {nextCursor ? (
        <a href={`/categoria/${slug}?cursor=${nextCursor}`} className="block w-full text-center py-2 border rounded-md">Cargar más</a>
      ) : (
        <div className="text-sm text-neutral-500">No hay más resultados</div>
      )}
    </div>
  );
}



