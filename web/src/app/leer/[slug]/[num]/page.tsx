import { prisma } from "@/lib/prisma";
import ReaderControls from "@/components/reader/ReaderControls";
import ProgressBar from "@/components/reader/ProgressBar";
import Link from "next/link";
import ReaderContent from "@/components/reader/ReaderContent";

interface Params { slug: string; num: string }

// Noto_Serif é aplicado apenas no componente cliente ReaderContent

export default async function ReaderPage({ params }: { params: Promise<Params> }) {
  const { slug, num } = await params;

  const story = await prisma.story.findUnique({ 
    where: { slug },
    include: { author: true }
  });
  if (!story) return null;

  const number = Number(num);
  const chapter = await prisma.chapter.findUnique({
    where: { storyId_number: { storyId: story.id, number } },
  });
  if (!chapter) return null;

  const prevNumber = number > 1 ? number - 1 : null;
  const nextChapter = await prisma.chapter.findFirst({
    where: { storyId: story.id, number: { gt: number }, isPublished: true },
    orderBy: { number: "asc" },
  });
  const nextNumber = nextChapter?.number ?? null;
  const total = await prisma.chapter.count({ where: { storyId: story.id, isPublished: true } });

  return (
    <div className="min-h-screen">
      <ProgressBar />
      <ReaderControls />
      <header className="mb-4 px-4">
        <h1 className="text-lg font-semibold">{story.title}{chapter.title ? ` — ${chapter.title}` : ``}</h1>
      </header>
      <ReaderContent 
        contentMd={chapter.contentMd} 
        chapterNumber={number} 
        totalChapters={total}
        isPdfOnly={chapter.isPdfOnly}
        storyTitle={story.title}
        authorName={story.author.penName}
        description={story.description}
        language={story.language}
        status={story.status}
        sourcePdfUrl={story.sourcePdfUrl}
      />
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t flex justify-between px-4 py-3">
        <Link
          href={prevNumber ? `/leer/${slug}/${prevNumber}` : `#`}
          aria-disabled={!prevNumber}
          className={`px-4 py-2 rounded-md bg-neutral-200 text-neutral-800 ${!prevNumber ? "opacity-50 pointer-events-none" : ""}`}
        >Anterior</Link>
        <Link
          href={nextNumber ? `/leer/${slug}/${nextNumber}` : `#`}
          prefetch
          aria-disabled={!nextNumber}
          className={`px-4 py-2 rounded-md bg-[var(--color-primary)] text-white ${!nextNumber ? "opacity-50 pointer-events-none" : ""}`}
        >Siguiente</Link>
      </nav>
    </div>
  );
}


