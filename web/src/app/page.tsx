import { prisma } from "@/lib/prisma";
import StoryCard from "@/components/shared/StoryCard";
import RecomendadosSection from "@/components/shared/RecomendadosSection";
import CategoryChips from "@/components/shared/CategoryChips";
import HeroSlider from "@/components/shared/HeroSlider";
import Link from "next/link";

interface StoryWithCategories {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  synopsis: string | null;
  categories?: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    chapters: number;
  };
  hotScore: number;
  readsTotal: number;
  status: string;
  updatedAt: Date;
}

export default async function Home() {
  let hot: StoryWithCategories[] = [];
  let mostRead: StoryWithCategories[] = [];
  let completed: StoryWithCategories[] = [];
  let featured: StoryWithCategories[] = [];

  try {
    [hot, mostRead, completed, featured] = await Promise.all([
      prisma.story.findMany({
        take: 6,
        orderBy: { hotScore: "desc" },
        include: {
          categories: { include: { category: true } },
          _count: { select: { chapters: true } }
        }
      }),
      prisma.story.findMany({
        take: 6,
        orderBy: { readsTotal: "desc" },
        include: {
          categories: { include: { category: true } },
          _count: { select: { chapters: true } }
        }
      }),
      prisma.story.findMany({
        take: 6,
        where: { status: "COMPLETED" },
        orderBy: { updatedAt: "desc" },
        include: {
          categories: { include: { category: true } },
          _count: { select: { chapters: true } }
        }
      }),
      // Featured stories para o hero slider
      prisma.story.findMany({
        take: 5,
        orderBy: { hotScore: "desc" },
        where: {
          coverUrl: { not: null }
        },
        include: {
          categories: { include: { category: true } },
          _count: { select: { chapters: true } }
        }
      }),
    ]);
  } catch (err) {
    console.error("Home: erro ao consultar banco. Degradando UI.", err);
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero Slider */}
      {featured.length > 0 && (
        <section className="mb-6">
          <HeroSlider stories={featured} />
        </section>
      )}

      {/* Categorias */}
      <section className="space-y-3 px-4">
        <h2 className="text-xl font-bold text-gray-900">Categorías</h2>
        <CategoryChips />
      </section>

      {/* Em Tendência */}
      <section id="hot" className="space-y-3">
        <div className="px-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">🔥 Em Tendência</h2>
          <Link href="/#hot" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Ver mais →
          </Link>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 px-4 scrollbar-hide">
          {hot.map(story => (
            <div key={story.id} className="min-w-[160px] w-40 sm:min-w-[180px] sm:w-48 shrink-0">
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      </section>

      {/* Mais Lidos */}
      <section id="most-read" className="space-y-3">
        <div className="px-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">📖 Más Leídos</h2>
          <Link href="/#most-read" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Ver mais →
          </Link>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 px-4 scrollbar-hide">
          {mostRead.map(story => (
            <div key={story.id} className="min-w-[160px] w-40 sm:min-w-[180px] sm:w-48 shrink-0">
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      </section>

      {/* Completos */}
      <section id="completos" className="space-y-3">
        <div className="px-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">✅ Completos</h2>
          <Link href="/#completos" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Ver mais →
          </Link>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 px-4 scrollbar-hide">
          {completed.map(story => (
            <div key={story.id} className="min-w-[160px] w-40 sm:min-w-[180px] sm:w-48 shrink-0">
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      </section>

      {/* Recomendados */}
      <div className="px-4">
        <RecomendadosSection />
      </div>
    </div>
  );
}
