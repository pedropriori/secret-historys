"use client";
import { useState } from "react";
import TagInput from "@/components/TagInput";

export default function AdminNewStoryPage() {
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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let coverUrl = formData.coverUrl;

      // Upload file if method is file
      if (uploadMethod === "file" && coverFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", coverFile);
        uploadFormData.append("slug", formData.slug);

        const uploadRes = await fetch("/api/admin/upload/cover", {
          method: "POST",
          body: uploadFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          coverUrl = uploadData.url;
        } else {
          throw new Error("Erro no upload da capa");
        }
      }

      const payload = {
        ...formData,
        coverUrl,
        categories: formData.categories,
        tags: formData.tags,
        author: { penName: formData.penName },
        manualRating: formData.manualRating ? parseFloat(formData.manualRating) : undefined
      };

      const res = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.location.href = "/admin/stories";
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao criar obra");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Auto-generate slug when title changes
      if (name === "title") {
        const slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-")
          .replace(/(^-|-$)+/g, "")
          + "-" + Math.random().toString(36).substr(2, 6);
        newData.slug = slug;
      }

      return newData;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Nova Obra</h1>

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
          <div className="flex gap-2">
            <input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="slug-exemplo"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => {
                const newSlug = formData.title
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^a-z0-9\s]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/(^-|-$)+/g, "")
                  + "-" + Math.random().toString(36).substr(2, 6);
                setFormData(prev => ({ ...prev, slug: newSlug }));
              }}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Regenerar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Gerado automaticamente baseado no título</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-3">Capa da Obra</label>

          {/* Upload Method Selection */}
          <div className="flex gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="uploadMethod"
                value="url"
                checked={uploadMethod === "url"}
                onChange={(e) => setUploadMethod(e.target.value as "url" | "file")}
                className="mr-2"
              />
              URL Pública
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="uploadMethod"
                value="file"
                checked={uploadMethod === "file"}
                onChange={(e) => setUploadMethod(e.target.value as "url" | "file")}
                className="mr-2"
              />
              Upload do PC
            </label>
          </div>

          {/* URL Input */}
          {uploadMethod === "url" && (
            <input
              name="coverUrl"
              value={formData.coverUrl}
              onChange={handleChange}
              placeholder="https://exemplo.com/capa.jpg"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* File Upload */}
          {uploadMethod === "file" && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Selecionar arquivo de imagem"
              />
              {coverPreview && (
                <div className="mt-3">
                  <img
                    src={coverPreview}
                    alt="Preview da capa"
                    className="w-32 h-48 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          )}
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Criando..." : "Criar Obra"}
          </button>
          <a
            href="/admin/stories"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}