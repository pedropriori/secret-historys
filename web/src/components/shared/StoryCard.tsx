import type { Story } from "@prisma/client";
import Image from "next/image";

interface StoryWithCategories extends Story {
  categories?: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    chapters: number;
  };
}

export function StoryCard({ story }: { story: StoryWithCategories }) {
  return (
    <a
      href={`/obra/${story.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 card-hover"
      aria-label={story.title}
    >
      <div className="relative overflow-hidden">
        {story.coverUrl ? (
          <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-purple-100 to-pink-100">
            <Image
              src={story.coverUrl}
              alt={story.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              sizes="(max-width: 640px) 160px, 180px"
            />
            {/* Overlay gradiente sutil no hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-gray-400 text-xs">Sin imagen</span>
            </div>
          </div>
        )}

        {/* Nota com ícone de estrela */}
        {story.manualRating && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <span>⭐</span>
            <span>{story.manualRating.toFixed(1)}</span>
          </div>
        )}

        {/* Badge de status */}
        {story.status === 'COMPLETED' && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
            Completo
          </div>
        )}
      </div>

      <div className="p-3">
        {/* Título */}
        <h3 className="font-bold text-sm leading-tight text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[2.5rem]">
          {story.title}
        </h3>

        {/* Categorias */}
        {story.categories && story.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {story.categories.slice(0, 2).map((storyCategory) => (
              <span
                key={storyCategory.category.id}
                className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200"
              >
                {storyCategory.category.name}
              </span>
            ))}
          </div>
        )}

        {/* Info adicional */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {story._count?.chapters || 0} caps
          </span>
          {story.readsTotal > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {story.readsTotal > 1000 ? `${(story.readsTotal / 1000).toFixed(1)}k` : story.readsTotal}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export default StoryCard;


