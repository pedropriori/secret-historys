"use client";
import { useState, useEffect } from "react";
import TagInput from "@/components/TagInput";

interface Story {
  id: string;
  title: string;
  slug: string;
  language: string;
  status: string;
  description: string;
  coverUrl?: string;
  author: { penName: string };
  categories: string[];
  tags: string[];
  manualRating?: number;
}

export default function AdminEditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const [story, setStory] = useState<Story | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    language: "es",
    status: "ONGOING",
    description: "",
    coverUrl: "",
    penName: "",
    categories: [] as string[],
    tags: [] as string[],
    manualRating: "" as string
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchStory() {
      try {
        const { id } = await params;
        const res = await fetch(`/api/admin/stories/${id}`);
        if (res.ok) {
          const data = await res.json();
          setStory(data);
          setFormData({
            title: data.title || "",
            slug: data.slug || "",
            language: data.language || "es",
            status: data.status || "ONGOING",
            description: data.description || "",
            coverUrl: data.coverUrl || "",
            penName: data.author?.penName || "",
            categories: data.categories || [],
            tags: data.tags || [],
            manualRating: data.manualRating ? data.manualRating.toString() : ""
          });
        } else {
          setError("Erro ao carregar obra");
        }
      } catch (err) {
        setError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    }
    fetchStory();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { id } = await params;
      const payload = {
        ...formData,
        categories: formData.categories,
        tags: formData.tags,
        author: { penName: formData.penName },
        manualRating: formData.manualRating ? parseFloat(formData.manualRating) : undefined
      };

      const res = await fetch(`/api/admin/stories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Obra atualizada com sucesso!");
        // Reload story data
        const updatedStory = await res.json();
        setStory(updatedStory.story);
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao atualizar obra");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta obra?")) return;

    setSaving(true);
    setError("");

    try {
      const { id } = await params;
      const res = await fetch(`/api/admin/stories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.href = "/admin/stories";
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao excluir obra");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-6">Carregando...</h1>
        <div className="text-center py-8">Carregando dados da obra...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-6">Obra não encontrada</h1>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">A obra solicitada não foi encontrada.</p>
          <a href="/admin/stories" className="text-blue-600 hover:underline">Voltar para lista de obras</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Editar Obra</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Título da obra"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="slug-exemplo"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Selecionar idioma"
            >
              <option value="es">Español</option>
              <option value="pt">Portugués</option>
              <option value="en">Inglés</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Selecionar status"
            >
              <option value="ONGOING">En Progreso</option>
              <option value="COMPLETED">Completo</option>
              <option value="HIATUS">Pausado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
          <input
            name="penName"
            value={formData.penName}
            onChange={handleChange}
            placeholder="Nome do autor"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL da Capa</label>
          <input
            name="coverUrl"
            value={formData.coverUrl}
            onChange={handleChange}
            placeholder="https://exemplo.com/capa.jpg"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descrição da obra"
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nota Manual (opcional)</label>
          <input
            name="manualRating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.manualRating}
            onChange={handleChange}
            placeholder="4.8"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Nota de 0 a 5 que aparecerá no card da obra</p>
        </div>

        <TagInput
          label="Categorias"
          placeholder="Digite uma categoria (ex: Romance, Ficção, Aventura)"
          value={formData.categories}
          onChange={(categories) => setFormData(prev => ({ ...prev, categories }))}
        />

        <TagInput
          label="Tags"
          placeholder="Digite uma tag (ex: amor, aventura, mistério)"
          value={formData.tags}
          onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
        />

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
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          <a
            href={`/admin/stories/${story?.id}/chapters`}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Gerenciar Capítulos
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Excluindo..." : "Excluir Obra"}
          </button>
          <a
            href="/admin/stories"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Voltar
          </a>
        </div>
      </form>
    </div>
  );
}