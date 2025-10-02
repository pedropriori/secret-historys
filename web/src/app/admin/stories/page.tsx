"use client";
import { useState, useEffect } from "react";

interface Story {
  id: string;
  title: string;
  slug: string;
  language: string;
  status: string;
  author: { penName: string };
  _count: { chapters: number };
}

export default function AdminStoriesListPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await fetch("/api/admin/stories?take=20");
        if (res.ok) {
          const data = await res.json();
          setStories(data.items || []);
        } else {
          setError("Erro ao carregar obras");
        }
      } catch (err) {
        setError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Obras</h1>
          <a href="/admin/stories/new" className="rounded bg-blue-600 text-white px-3 py-2 text-sm">Nova Obra</a>
        </div>
        <div className="text-center py-8">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Obras</h1>
        <a href="/admin/stories/new" className="rounded bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700">Nova Obra</a>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {stories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma obra encontrada. <a href="/admin/stories/new" className="text-blue-600 hover:underline">Criar primeira obra</a>
        </div>
      ) : (
        <div className="grid gap-3">
          {stories.map((story) => (
            <a 
              key={story.id} 
              href={`/admin/stories/${story.id}`} 
              className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{story.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {story.slug} · {story.language} · {story.status}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Por {story.author.penName} · {story._count.chapters} capítulos
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}


