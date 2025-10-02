"use client";
import { useState } from "react";

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Selecione um arquivo ZIP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Importação concluída! Obra ID: ${data.storyId}, Capítulos: ${data.chapters}`);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById("zip-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao importar arquivo");
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
      <h1 className="text-2xl font-semibold mb-6">Importar ZIP</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Estrutura do ZIP:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <code>story.json</code> - Metadados da obra</li>
          <li>• <code>chapters/</code> - Pasta com arquivos .md dos capítulos</li>
          <li>• <code>cover.jpg</code> - Imagem da capa (opcional)</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-green-900 mb-2">Formatos de Capítulos Suportados:</h3>
        <div className="text-sm text-green-800 space-y-2">
          <div>
            <strong>Numeração simples:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• <code>001.md</code>, <code>002.md</code>, <code>003.md</code></li>
              <li>• <code>1.md</code>, <code>2.md</code>, <code>3.md</code></li>
            </ul>
          </div>
          <div>
            <strong>Com prefixos:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• <code>capitulo-1.md</code>, <code>capitulo-2.md</code></li>
              <li>• <code>chapter-1.md</code>, <code>chapter-2.md</code></li>
              <li>• <code>cap-1.md</code>, <code>cap-2.md</code></li>
            </ul>
          </div>
          <div>
            <strong>Com títulos:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• <code>1-introducao.md</code>, <code>2-desenvolvimento.md</code></li>
              <li>• <code>introducao-1.md</code>, <code>desenvolvimento-2.md</code></li>
            </ul>
          </div>
          <div className="text-xs text-green-700 mt-2">
            <strong>Nota:</strong> O título do capítulo será extraído da primeira linha do Markdown (ex: <code># Título do Capítulo</code>)
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="zip-file" className="block text-sm font-medium text-gray-700 mb-1">
            Arquivo ZIP
          </label>
          <input
            id="zip-file"
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            disabled={loading || !file}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Importando..." : "Importar ZIP"}
          </button>
          <a
            href="/admin"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Voltar
          </a>
        </div>
      </form>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Exemplo de story.json:</h3>
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Novo:</strong> O campo <code>slug</code> é agora opcional! Se não fornecido, será gerado automaticamente baseado no título.
          </p>
        </div>
        <pre className="text-xs text-gray-700 overflow-x-auto">
          {`{
  "title": "Minha História",
  "language": "pt",
  "status": "ONGOING",
  "description": "Uma história incrível...",
  "author": {
    "penName": "Autor Fictício"
  },
  "categories": ["Romance", "Ficção"],
  "tags": ["amor", "aventura"],
  "coverFile": "cover.jpg"
}`}
        </pre>
        <div className="mt-2 text-xs text-gray-600">
          <p><strong>Nota:</strong> O slug será gerado automaticamente como: <code>minha-historia-abc123</code></p>
        </div>
      </div>
    </div>
  );
}