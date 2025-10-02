"use client";
import { useState, useEffect } from "react";

interface Story {
  id: string;
  title: string;
  slug: string;
  _count: {
    chapters: number;
  };
}

export default function AdminImportChaptersPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/admin/stories");
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories || []);
      }
    } catch (err) {
      setError("Erro ao carregar obras");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryId || !file) {
      setError("Selecione uma obra e um arquivo ZIP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/stories/${selectedStoryId}/chapters/bulk`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Importação concluída! ${data.chaptersAdded} capítulos adicionados à obra "${data.storyTitle}".`);
        setFile(null);
        setSelectedStoryId("");
        fetchStories(); // Atualiza contagem de capítulos

        // Reset file input
        const fileInput = document.getElementById("zip-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao importar capítulos");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/zip" || selectedFile.name.endsWith(".zip")) {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Por favor, selecione um arquivo ZIP válido");
        setFile(null);
      }
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Importar Capítulos em Lote</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Como funciona:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Selecione uma obra existente</li>
          <li>• Faça upload de um ZIP contendo apenas os capítulos</li>
          <li>• Os capítulos serão adicionados à obra selecionada</li>
          <li>• O sistema detectará conflitos de numeração automaticamente</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-green-900 mb-2">Estrutura do ZIP:</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• <strong>Opção 1:</strong> Arquivos .md na raiz: <code>001.md</code>, <code>002.md</code>, etc.</li>
          <li>• <strong>Opção 2:</strong> Pasta <code>chapters/</code> com arquivos .md</li>
          <li>• Formatos suportados: <code>001.md</code>, <code>capitulo-1.md</code>, <code>1-introducao.md</code>, etc.</li>
          <li>• Títulos extraídos da primeira linha do Markdown</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="story-select" className="block text-sm font-medium text-gray-700 mb-1">
            Selecionar Obra
          </label>
          <select
            id="story-select"
            value={selectedStoryId}
            onChange={(e) => setSelectedStoryId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Escolha uma obra...</option>
            {stories.map((story) => (
              <option key={story.id} value={story.id}>
                {story.title} ({story._count.chapters} capítulos)
              </option>
            ))}
          </select>
          {selectedStoryId && (
            <p className="text-sm text-gray-600 mt-1">
              Obra selecionada: {stories.find(s => s.id === selectedStoryId)?.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="zip-file" className="block text-sm font-medium text-gray-700 mb-1">
            Arquivo ZIP com Capítulos
          </label>
          <input
            id="zip-file"
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          {file && (
            <p className="text-sm text-gray-600 mt-1">
              Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !selectedStoryId || !file}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Importando..." : "Importar Capítulos"}
          </button>
          <a
            href="/admin"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Voltar
          </a>
        </div>
      </form>

      {stories.length === 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Nenhuma obra encontrada.</strong> Crie uma obra primeiro antes de importar capítulos.
          </p>
          <a
            href="/admin/stories/new"
            className="text-yellow-700 hover:text-yellow-900 text-sm underline mt-2 inline-block"
          >
            Criar nova obra
          </a>
        </div>
      )}
    </div>
  );
}
