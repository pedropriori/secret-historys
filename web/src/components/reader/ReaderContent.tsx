"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useReadingPrefs } from "@/hooks/useReadingPrefs";
import { Noto_Serif } from "next/font/google";
import PdfReader from "./PdfReader";

const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"] });

interface Props {
  contentMd: string;
  chapterNumber: number;
  totalChapters: number;
  isPdfOnly?: boolean;
  storyTitle?: string;
  authorName?: string;
  description?: string;
  language?: string;
  status?: string;
  sourcePdfUrl?: string;
}

export default function ReaderContent({
  contentMd,
  chapterNumber,
  totalChapters,
  isPdfOnly = false,
  storyTitle = "",
  authorName = "",
  description = "",
  language = "es",
  status = "ONGOING",
  sourcePdfUrl
}: Props) {
  const { prefs } = useReadingPrefs();

  // Se for um capítulo PDF, usar o componente especializado
  if (isPdfOnly && sourcePdfUrl) {
    return (
      <PdfReader
        pdfUrl={sourcePdfUrl}
        chapterTitle={`Capítulo ${chapterNumber}`}
        storyTitle={storyTitle}
        authorName={authorName}
        description={description}
        language={language}
        status={status}
      />
    );
  }

  // Comportamento normal para capítulos de texto
  const fontFamilyClass = prefs.font === "serif" ? notoSerif.className : "";
  const themeBg = prefs.theme === "sepia" ? "bg-[var(--color-sepia)]" : prefs.theme === "dark" ? "bg-neutral-900 text-neutral-100" : "bg-white text-neutral-900";

  return (
    <div
      className={`min-h-screen ${themeBg} px-4 py-6`}
      style={{
        fontSize: `${prefs.fontSize}px`,
        lineHeight: prefs.lineHeight
      }}
    >
      <article className={`${fontFamilyClass} prose prose-neutral max-w-3xl mx-auto`}>
        <p className="text-sm text-neutral-600">Capítulo {chapterNumber} de {totalChapters}</p>
        <Markdown remarkPlugins={[remarkGfm]}>{contentMd}</Markdown>
      </article>
    </div>
  );
}





