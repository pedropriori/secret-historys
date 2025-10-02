"use client";
import { useState, useEffect } from "react";
import TagInput from "@/components/TagInput";
import { createSlug } from "@/lib/slug";

export default function AdminImportPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [useCoverUrl, setUseCoverUrl] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [penName, setPenName] = useState("");
  const [language, setLanguage] = useState("es");
  const [status, setStatus] = useState("ONGOING");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [manualRating, setManualRating] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Gerar slug automaticamente quando o título mudar
  useEffect(() => {
    if (title && !slug) {
      const autoSlug = createSlug(title);
      setSlug(autoSlug);
    }
  }, [title, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Selecione um PDF"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const meta = {
        title: title || file.name.replace(/\.pdf$/i, ""),
        slug: slug || undefined, // Slug será gerado automaticamente se não fornecido
        language,
        status,
        description: description || "Imported from PDF",
        author: { penName: penName || "Anónimo" },
        categories: categories,
        tags: tags,
        manualRating: manualRating ? Number(manualRating) : undefined,
      };
      const formData = new FormData();
      formData.append("file", file);
      formData.append("meta", JSON.stringify(meta));
      if (useCoverUrl && coverUrl) {
        formData.append("coverUrl", coverUrl);
      } else if (cover) {
        formData.append("cover", cover);
      }

      const res = await fetch("/api/admin/import/pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.error || "Erro ao importar PDF");
      setSuccess(`Importação concluída! Obra ID: ${data.storyId}, Capítulos: ${data.chapters}`);
      setFile(null); setCover(null); setCoverUrl(""); setUseCoverUrl(false); setTitle(""); setSlug(""); setPenName(""); setDescription(""); setManualRating("");
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Importar PDF</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-900">
        Faça upload de um PDF. O sistema irá criar uma obra com um capítulo que contém um link direto para o PDF. O PDF original será armazenado no Storage e exibido diretamente no leitor.
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pdf-file" className="block text-sm font-medium mb-1">Arquivo PDF</label>
          <input id="pdf-file" type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full border rounded-md px-3 py-2" required />
          {file && <p className="text-xs text-gray-600 mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Capa (opcional)</label>

          {/* Toggle para escolher entre upload e URL */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setUseCoverUrl(false)}
              className={`px-3 py-1 text-sm rounded-md border ${!useCoverUrl
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              📁 Upload de Arquivo
            </button>
            <button
              type="button"
              onClick={() => setUseCoverUrl(true)}
              className={`px-3 py-1 text-sm rounded-md border ${useCoverUrl
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              🔗 URL da Imagem
            </button>
          </div>

          {/* Campo de upload de arquivo */}
          {!useCoverUrl && (
            <div>
              <input
                id="cover-file"
                type="file"
                accept="image/*"
                onChange={(e) => setCover(e.target.files?.[0] || null)}
                className="w-full border rounded-md px-3 py-2"
              />
              {cover && (
                <p className="text-xs text-gray-600 mt-1">
                  {cover.name} ({(cover.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          {/* Campo de URL */}
          {useCoverUrl && (
            <div>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full border rounded-md px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cole aqui a URL pública da imagem que será usada como capa
              </p>
              {coverUrl && (
                <div className="mt-2">
                  <img
                    src={coverUrl}
                    alt="Preview da capa"
                    className="max-w-32 max-h-32 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Título</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="Título da obra" />
          </div>
          <div>
            <label htmlFor="pen-name" className="block text-sm font-medium mb-1">Autor (pen name)</label>
            <input id="pen-name" value={penName} onChange={(e) => setPenName(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="Anónimo" />
          </div>
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug (opcional)</label>
          <input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Deixe vazio para gerar automaticamente"
          />
          <p className="text-xs text-gray-600 mt-1">URL amigável para a obra. Exemplo: "clecanian-elijiendo-theo"</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="language" className="block text-sm font-medium mb-1">Idioma</label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full border rounded-md px-3 py-2">
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-md px-3 py-2">
              <option value="ONGOING">Em andamento</option>
              <option value="COMPLETED">Completa</option>
              <option value="HIATUS">Hiato</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium mb-1">Nota Manual (opcional)</label>
          <input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={manualRating}
            onChange={(e) => setManualRating(e.target.value ? Number(e.target.value) : "")}
            placeholder="4.8"
            className="w-full border rounded-md px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">Nota de 0 a 5 que aparecerá no card da obra</p>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={3} />
        </div>
        <TagInput
          label="Categorias"
          placeholder="Digite uma categoria (ex: Romance, Fantasia, Paranormal)"
          value={categories}
          onChange={setCategories}
        />

        <TagInput
          label="Tags"
          placeholder="Digite uma tag (ex: vampiros, romance, fantasía)"
          value={tags}
          onChange={setTags}
        />

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading || !file} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Importando..." : "Importar PDF"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFile(null); setCover(null); setCoverUrl(""); setUseCoverUrl(false); setTitle(""); setSlug(""); setPenName(""); setDescription(""); setManualRating("");
              setError(""); setSuccess("");
            }}
            className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600"
          >
            Limpar
          </button>
          <a href="/admin" className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400">Voltar</a>
        </div>
      </form>
    </div>
  );
}


