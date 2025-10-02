"use client";

import { useState } from "react";
import { useReadingPrefs } from "@/hooks/useReadingPrefs";

interface Props {
  pdfUrl: string;
  chapterTitle: string;
  storyTitle: string;
  authorName: string;
  description?: string;
  language: string;
  status: string;
}

export default function PdfReader({
  pdfUrl,
  chapterTitle,
  storyTitle,
  authorName,
  description,
  language,
  status
}: Props) {
  const { prefs } = useReadingPrefs();
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const themeBg = prefs.theme === "sepia" ? "bg-[var(--color-sepia)]" :
    prefs.theme === "dark" ? "bg-neutral-900 text-neutral-100" :
      "bg-white text-neutral-900";

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONGOING': return 'Em andamento';
      case 'COMPLETED': return 'Completa';
      case 'HIATUS': return 'Hiato';
      default: return status;
    }
  };

  const getLanguageText = (lang: string) => {
    switch (lang) {
      case 'es': return 'Español';
      case 'pt': return 'Português';
      case 'en': return 'English';
      default: return lang;
    }
  };

  return (
    <div
      className={`min-h-screen ${themeBg}`}
      style={{
        fontSize: `${prefs.fontSize}px`,
        lineHeight: prefs.lineHeight
      }}
    >
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{chapterTitle}</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{storyTitle}</p>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="ml-3 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Informações da obra"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Nova Aba
            </a>
            <a
              href={pdfUrl}
              download
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Baixar
            </a>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Info
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer - Full Width on Mobile */}
      <div className="px-0">
        <div className="relative w-full" style={{ height: 'calc(100vh - 140px)' }}>
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsPdfLoaded(true)}
            title={`PDF: ${chapterTitle}`}
          />

          {!isPdfLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400">Carregando PDF...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Info Panel */}
      {showInfo && (
        <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Informações da Obra</h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">📚 Detalhes</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Título:</strong> {storyTitle}</div>
                      <div><strong>Autor:</strong> {authorName}</div>
                      <div><strong>Idioma:</strong> {getLanguageText(language)}</div>
                      <div><strong>Status:</strong> {getStatusText(status)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">📋 Descrição</h4>
                  <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {description || "Nenhuma descrição disponível para esta obra."}
                  </p>
                </div>
              </div>

              {/* Mobile Tips */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">💡 Dicas para Leitura</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Toque e arraste para navegar pelas páginas</li>
                  <li>• Use o zoom com gestos de pinça</li>
                  <li>• "Nova Aba" abre o PDF em tela cheia</li>
                  <li>• "Baixar" salva o arquivo no dispositivo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
