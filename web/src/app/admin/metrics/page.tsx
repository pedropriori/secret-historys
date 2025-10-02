"use client";

import { useState } from "react";

interface MetricsStats {
  totalStories: number;
  avgReads: number;
  avgRating: number;
  avgLikes: number;
  avgHotScore: number;
}

export default function MetricsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastStats, setLastStats] = useState<MetricsStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMetrics = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/generate-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar métricas");
      }

      setLastStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gerador de Métricas</h1>
        <p className="text-gray-600 mt-2">
          Gera dados aleatórios realísticos para todas as obras do sistema
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Atenção
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Esta ação irá sobrescrever as métricas atuais de todas as obras com dados aleatórios:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Notas:</strong> Entre 4.2 e 5.0 (distribuição realística)</li>
                <li><strong>Leituras:</strong> Entre 500K e 19.7M (distribuição realística)</li>
                <li><strong>Likes:</strong> Calculados baseado nas leituras (1-3%)</li>
                <li><strong>Hot Score:</strong> Calculado automaticamente baseado nas métricas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Gerar Métricas Aleatórias
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Clique no botão abaixo para gerar dados realísticos para todas as obras
            </p>
          </div>
          <button
            onClick={handleGenerateMetrics}
            disabled={isGenerating}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors
              ${isGenerating
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando...
              </div>
            ) : (
              "Gerar Métricas"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {lastStats && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Métricas Geradas com Sucesso!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Dados atualizados para {lastStats.totalStories} obras</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Média de Leituras
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(lastStats.avgReads)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Média de Nota
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {lastStats.avgRating}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Média de Likes
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(lastStats.avgLikes)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Média Hot Score
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {lastStats.avgHotScore}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Como Funciona
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              1
            </div>
            <div>
              <strong>Leituras:</strong> Geradas com distribuição realística - 70% entre 500K-5M, 25% entre 5M-15M, 5% entre 15M-19.7M
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              2
            </div>
            <div>
              <strong>Notas:</strong> Geradas entre 4.2 e 5.0 com distribuição realística - 60% entre 4.2-4.7, 30% entre 4.7-4.9, 10% entre 4.9-5.0
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              3
            </div>
            <div>
              <strong>Likes:</strong> Calculados automaticamente como 1-3% do número de leituras
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              4
            </div>
            <div>
              <strong>Hot Score:</strong> Calculado automaticamente baseado na fórmula: (log10(leituras) × 100) + (nota × 20) + (log10(likes) × 50)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
