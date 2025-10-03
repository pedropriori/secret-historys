"use client";
import { useState, useEffect } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ stories: 0, chapters: 0, authors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stories?take=1");
        if (res.ok) {
          const data = await res.json();
          setStats({
            stories: data.items?.length || 0,
            chapters: 0, // TODO: implementar endpoint de stats
            authors: 0
          });
        }
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Obras</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.stories}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Capítulos</h3>
            <p className="text-3xl font-bold text-green-600">{stats.chapters}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Autores</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.authors}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/stories"
          className="block rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-medium">Gerenciar Obras</h3>
          <p className="text-gray-600 text-sm mt-2">Visualizar, editar e excluir obras</p>
        </a>
        <a
          href="/admin/stories/new"
          className="block rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-medium">Nova Obra</h3>
          <p className="text-gray-600 text-sm mt-2">Criar uma nova obra</p>
        </a>
        <a
          href="/admin/import"
          className="block rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-medium">Importar ZIP</h3>
          <p className="text-gray-600 text-sm mt-2">Importar obra completa via ZIP</p>
        </a>
        <a
          href="/admin/import-chapters"
          className="block rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-medium">Importar Capítulos</h3>
          <p className="text-gray-600 text-sm mt-2">Importar capítulos em lote para obra existente</p>
        </a>
        <a
          href="/admin/banners"
          className="block rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-medium">Gerenciar Banners</h3>
          <p className="text-gray-600 text-sm mt-2">Controle os banners do slider principal</p>
        </a>
        <a
          href="/admin/metrics"
          className="block rounded-lg border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-medium">Gerar Métricas</h3>
          <p className="text-gray-600 text-sm mt-2">Gerar dados aleatórios para trending e leituras</p>
        </a>
      </div>
    </div>
  );
}


