"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useReadingPrefs } from "@/hooks/useReadingPrefs";
import { Noto_Serif } from "next/font/google";

const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"] });

interface Props {
  contentMd: string;
  chapterNumber: number;
  totalChapters: number;
}

export default function ReaderContent({ contentMd, chapterNumber, totalChapters }: Props) {
  const { prefs } = useReadingPrefs();

  const fontFamilyClass = prefs.font === "serif" ? notoSerif.className : "";
  const themeBg = prefs.theme === "sepia" ? "bg-[var(--color-sepia)]" : prefs.theme === "dark" ? "bg-neutral-900 text-neutral-100" : "bg-white text-neutral-900";

  return (
    <div className={`min-h-screen ${themeBg} px-4 py-6`} style={{ fontSize: `${prefs.fontSize}px`, lineHeight: prefs.lineHeight }}>
      <article className={`${fontFamilyClass} prose prose-neutral max-w-3xl mx-auto`}>
        <p className="text-sm text-neutral-600">Capítulo {chapterNumber} de {totalChapters}</p>
        <Markdown remarkPlugins={[remarkGfm]}>{contentMd}</Markdown>
      </article>
    </div>
  );
}




