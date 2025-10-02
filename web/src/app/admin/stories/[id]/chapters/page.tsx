"use client";
import { useState, useEffect } from "react";

interface Chapter {
  id: string;
  number: number;
  title: string;
  contentMd: string;
  lengthChars: number;
  isPublished: boolean;
  publishedAt: string;
}

interface Story {
  id: string;
  title: string;
  slug: string;
}

export default function AdminChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    number: 1,
    title: "",
    contentMd: "",
    isPublished: true
  });
  const [contentType, setContentType] = useState<"markdown" | "plain">("plain");

  // Bulk import states
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");

  useEffect(() => {
    fetchStoryAndChapters();
  }, [params]);

  const fetchStoryAndChapters = async () => {
    try {
      const { id } = await params;
      // Fetch story details
      const storyRes = await fetch(`/api/admin/stories/${id}`);
      if (storyRes.ok) {
        const storyData = await storyRes.json();
        setStory(storyData);
      }

      // Fetch chapters (we'll need to create this endpoint)
      const chaptersRes = await fetch(`/api/admin/stories/${id}/chapters`);
      if (chaptersRes.ok) {
        const chaptersData = await chaptersRes.json();
        setChapters(chaptersData.chapters || []);
      }
    } catch (err) {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { id } = await params;
      const payload = {
        chapters: [formData]
      };

      const res = await fetch(`/api/admin/stories/${id}/chapters/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddForm(false);
        resetForm();
        fetchStoryAndChapters();
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar capítulo");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm("Tem certeza que deseja excluir este capítulo?")) return;

    try {
      const { id } = await params;
      const res = await fetch(`/api/admin/stories/${id}/chapters/${chapterId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchStoryAndChapters();
      } else {
        setError("Erro ao excluir capítulo");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value
    }));
  };

  const resetForm = () => {
    setFormData({
      number: chapters.length + 1,
      title: "",
      contentMd: "",
      isPublished: true
    });
    setContentType("plain");
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      setBulkError("Selecione um arquivo ZIP");
      return;
    }

    setBulkLoading(true);
    setBulkError("");
    setBulkSuccess("");

    try {
      const { id } = await params;
      const formData = new FormData();
      formData.append("file", bulkFile);

      const res = await fetch(`/api/admin/stories/${id}/chapters/bulk`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setBulkSuccess(`Importação concluída! ${data.chaptersAdded} capítulos adicionados.`);
        setBulkFile(null);
        setShowBulkImport(false);
        fetchStoryAndChapters();

        // Reset file input
        const fileInput = document.getElementById("bulk-zip-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const data = await res.json();
        setBulkError(data.error || "Erro ao importar capítulos");
      }
    } catch (err) {
      setBulkError("Erro de conexão");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/zip" || selectedFile.name.endsWith(".zip")) {
        setBulkFile(selectedFile);
        setBulkError("");
      } else {
        setBulkError("Por favor, selecione um arquivo ZIP válido");
        setBulkFile(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold mb-6">Carregando...</h1>
        <div className="text-center py-8">Carregando capítulos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Capítulos</h1>
          {story && (
            <p className="text-gray-600">Obra: {story.title}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showAddForm ? "Cancelar" : "Adicionar Capítulo"}
          </button>
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            {showBulkImport ? "Cancelar" : "Importar em Lote"}
          </button>
          <a
            href={`/admin/stories/${story?.id}`}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Voltar para Obra
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Chapter Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Adicionar Novo Capítulo</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  name="number"
                  type="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Número do capítulo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="isPublished"
                  value={formData.isPublished.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.value === "true" }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Status de publicação"
                >
                  <option value="true">Publicado</option>
                  <option value="false">Rascunho</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Título do capítulo"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Conteúdo do Capítulo
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="contentType"
                      value="plain"
                      checked={contentType === "plain"}
                      onChange={(e) => setContentType(e.target.value as "plain" | "markdown")}
                      className="mr-1"
                    />
                    Texto Simples
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="contentType"
                      value="markdown"
                      checked={contentType === "markdown"}
                      onChange={(e) => setContentType(e.target.value as "plain" | "markdown")}
                      className="mr-1"
                    />
                    Markdown
                  </label>
                </div>
              </div>

              <textarea
                name="contentMd"
                value={formData.contentMd}
                onChange={handleChange}
                placeholder={
                  contentType === "plain"
                    ? "Cole aqui o texto do capítulo...\n\nExemplo:\nHoy, para variar, el auto de Vladislav no estaba frente a la casa. Él solía visitarme esporádicamente..."
                    : "# Título do Capítulo\n\nConteúdo do capítulo em Markdown..."
                }
                rows={12}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />

              <div className="mt-2 text-xs text-gray-500">
                {contentType === "plain" ? (
                  <div>
                    <p><strong>Texto Simples:</strong> Cole o texto diretamente, sem formatação especial.</p>
                    <p>O sistema preservará quebras de linha e parágrafos automaticamente.</p>
                  </div>
                ) : (
                  <div>
                    <p><strong>Markdown:</strong> Use formatação especial como <code>**negrito**</code>, <code>*itálico*</code>, <code># títulos</code></p>
                    <p>Suporte completo a formatação rica para leitura.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar Capítulo"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Import Form */}
      {showBulkImport && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Importar Capítulos em Lote</h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">Estrutura do ZIP:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Opção 1:</strong> Arquivos .md na raiz: <code>001.md</code>, <code>002.md</code>, etc.</li>
              <li>• <strong>Opção 2:</strong> Pasta <code>chapters/</code> com arquivos .md</li>
              <li>• Formatos suportados: <code>001.md</code>, <code>capitulo-1.md</code>, <code>1-introducao.md</code>, etc.</li>
            </ul>
          </div>

          <form onSubmit={handleBulkImport} className="space-y-4">
            <div>
              <label htmlFor="bulk-zip-file" className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo ZIP com Capítulos
              </label>
              <input
                id="bulk-zip-file"
                type="file"
                accept=".zip"
                onChange={handleBulkFileChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              {bulkFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Arquivo selecionado: {bulkFile.name} ({(bulkFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {bulkError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {bulkError}
              </div>
            )}

            {bulkSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {bulkSuccess}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={bulkLoading || !bulkFile}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading ? "Importando..." : "Importar Capítulos"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkImport(false);
                  setBulkFile(null);
                  setBulkError("");
                  setBulkSuccess("");
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chapters List */}
      <div className="space-y-3">
        {chapters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum capítulo encontrado. Adicione o primeiro capítulo!
          </div>
        ) : (
          chapters
            .sort((a, b) => a.number - b.number)
            .map((chapter) => (
              <div key={chapter.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                        Cap. {chapter.number}
                      </span>
                      <h3 className="font-medium text-gray-900">
                        {chapter.title || `Capítulo ${chapter.number}`}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${chapter.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {chapter.isPublished ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {chapter.lengthChars} caracteres
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Criado em: {new Date(chapter.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingChapter(chapter)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(chapter.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
