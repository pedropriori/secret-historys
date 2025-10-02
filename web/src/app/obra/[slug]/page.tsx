import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ExpandableDescription } from "@/components/shared/ExpandableDescription";

// Función para generar número aleatorio de lectores
function generateRandomReaders(): string {
  const min = 500000;
  const max = 10200000;
  const readers = Math.floor(Math.random() * (max - min + 1)) + min;

  if (readers >= 1000000) {
    return `${(readers / 1000000).toFixed(1)}M`;
  } else if (readers >= 1000) {
    return `${(readers / 1000).toFixed(0)}k`;
  }
  return readers.toString();
}

// Función para renderizar estrellas
function renderStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return "⭐".repeat(fullStars) + (hasHalfStar ? "⭐" : "") + "☆".repeat(emptyStars);
}

// Función para traducir status
function translateStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'ONGOING': 'En Progreso',
    'COMPLETED': 'Completo',
    'HIATUS': 'Pausado'
  };
  return statusMap[status] || status;
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await prisma.story.findUnique({
    where: { slug },
    include: {
      author: true,
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      chapters: {
        where: { isPublished: true },
        orderBy: { number: "asc" }
      },
      _count: { select: { chapters: true } },
    },
  });
  if (!story) return notFound();

  const firstChapter = story.chapters[0];
  const readers = generateRandomReaders();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Header com poster e informações principais */}
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">

            {/* Poster */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              {story.coverUrl ? (
                <img
                  src={story.coverUrl}
                  alt={story.title}
                  className="w-40 h-60 md:w-48 md:h-72 object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="w-40 h-60 md:w-48 md:h-72 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Informações principais */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-black mb-1">
                  {story.title}
                </h1>
                <p className="text-base md:text-xl text-gray-600">
                  por <span className="font-semibold">{story.author?.penName}</span>
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EAE3D9] text-[#CE7F78]">
                    {translateStatus(story.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nota y lectores */}
        {story.manualRating && (
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-black">{story.manualRating.toFixed(1)}</span>
                <span className="text-lg">{renderStars(story.manualRating)}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">{readers}</span> lectores
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <h3 className="text-lg font-semibold text-black mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {story.tags.map((storyTag: any) => (
                <span
                  key={storyTag.tag.id}
                  className="text-sm font-medium text-[#CE7F78] bg-[#EAE3D9] px-3 py-1 rounded-full"
                >
                  {storyTag.tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <h3 className="text-lg font-semibold text-black mb-3">Descripción</h3>
          <ExpandableDescription description={story.description} />
        </div>

        {/* Capítulos */}
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Capítulos</h3>
            <span className="text-sm text-gray-500">{story.chapters.length} capítulos</span>
          </div>

          {story.chapters.length > 0 ? (
            <div className="space-y-2">
              {story.chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`/leer/${story.slug}/${chapter.number}`}
                  className="block p-3 rounded-lg border hover:bg-gray-50 hover:border-[#CE7F78] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-black">
                        Capítulo {chapter.number}
                      </span>
                      {chapter.title && (
                        <span className="text-gray-600 ml-2">- {chapter.title}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {chapter.lengthChars.toLocaleString()} caracteres
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Ningún capítulo disponible aún
            </div>
          )}
        </div>

        {/* Botón de lectura */}
        {firstChapter && (
          <div className="sticky bottom-4 z-10">
            <a
              href={`/leer/${story.slug}/${firstChapter.number}`}
              className="block w-full bg-[#CE7F78] text-white text-center py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-[#B86B64] transition-colors"
            >
              {story.chapters.length > 0 ? "Comenzar a Leer" : "Pronto Disponible"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}


