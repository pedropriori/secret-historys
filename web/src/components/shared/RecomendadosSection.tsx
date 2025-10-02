"use client";

import { useEffect, useRef, useState } from "react";
import StoryCard from "@/components/shared/StoryCard";

interface Story {
  id: string;
  slug: string;
  title: string;
  coverUrl?: string | null;
  status: string;
  readsTotal: number;
}

export function RecomendadosSection() {
  const [stories, setStories] = useState<Story[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  async function fetchPage(cursor?: string | null) {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const url = new URL("/api/recommendations", window.location.origin);
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString());
    const data = await res.json();
    setStories(prev => {
      const existing = new Set(prev.map((p) => p.id));
      const incoming: Story[] = (data.stories ?? []).filter((s: Story) => !existing.has(s.id));
      return [...prev, ...incoming];
    });
    setNextCursor(data.nextCursor ?? null);
    setHasMore(Boolean(data.nextCursor));
    setIsLoading(false);
  }

  useEffect(() => {
    fetchPage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) fetchPage(nextCursor);
    }, { rootMargin: "200px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor]);

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">Recomendados</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stories.map((s) => (
          <StoryCard key={s.id} story={s as any} />
        ))}
      </div>
      <div ref={sentinelRef} aria-hidden className="h-8" />
      {isLoading ? <div className="text-sm text-neutral-600">Cargando…</div> : null}
      {!hasMore ? <div className="text-sm text-neutral-500">No hay más resultados</div> : null}
    </section>
  );
}

export default RecomendadosSection;


