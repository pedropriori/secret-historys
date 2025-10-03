"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkText: string | null;
  isActive: boolean;
  order: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    linkText: "",
    isActive: true,
    order: 0,
    startDate: "",
    endDate: ""
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/admin/banners");
      const data = await response.json();

      if (response.ok) {
        setBanners(data.banners);
      } else {
        setError(data.error || "Erro ao carregar banners");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/banners/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({ ...prev, imageUrl: data.fileUrl }));
        setError(null); // Limpar erros anteriores
      } else {
        const errorMessage = data.error || "Erro no upload";
        const errorDetails = data.details ? `\nDetalhes: ${JSON.stringify(data.details, null, 2)}` : "";
        setError(errorMessage + errorDetails);
      }
    } catch (err) {
      setError("Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.id}`
        : "/api/admin/banners";

      const method = editingBanner ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchBanners();
        resetForm();
        setError(null);
      } else {
        setError(data.error || "Erro ao salvar banner");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      linkText: banner.linkText || "",
      isActive: banner.isActive,
      order: banner.order,
      startDate: banner.startDate ? banner.startDate.split("T")[0] : "",
      endDate: banner.endDate ? banner.endDate.split("T")[0] : ""
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;

    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBanners();
      } else {
        const data = await response.json();
        setError(data.error || "Erro ao excluir banner");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      linkText: "",
      isActive: true,
      order: 0,
      startDate: "",
      endDate: ""
    });
    setEditingBanner(null);
    setShowCreateForm(false);
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      });

      if (response.ok) {
        await fetchBanners();
      } else {
        const data = await response.json();
        setError(data.error || "Erro ao atualizar banner");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciar Banners</h1>
          <p className="text-gray-600 mt-1">
            Controle os banners exibidos no slider da página inicial
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Novo Banner
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Banners */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Banners ({banners.length})
          </h3>
        </div>

        {banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum banner cadastrado
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {banners.map((banner) => (
              <div key={banner.id} className="p-6 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {banner.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {banner.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Ordem: {banner.order}
                    </span>
                  </div>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                  )}
                  {banner.linkUrl && (
                    <p className="text-xs text-blue-600 truncate">
                      Link: {banner.linkUrl}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${banner.isActive
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    {banner.isActive ? 'Desativar' : 'Ativar'}
                  </button>

                  <button
                    onClick={() => handleEdit(banner)}
                    className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {editingBanner ? 'Editar Banner' : 'Novo Banner'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Fechar modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite o título do banner"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite o subtítulo do banner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite a descrição do banner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem *
                  </label>

                  {/* Instruções de Dimensões */}
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">Especificações Recomendadas</h4>
                        <div className="mt-1 text-sm text-blue-700">
                          <p className="font-medium">Dimensões ideais: 1920 x 1080 pixels (16:9)</p>
                          <p>• Resolução: 72 PPI</p>
                          <p>• Formatos: JPG, PNG, WebP</p>
                          <p>• Tamanho máximo: 5MB</p>
                          <p>• Proporção: 16:9 para melhor exibição</p>
                        </div>
                        <div className="mt-2">
                          <a
                            href="https://www.canva.com/create/resize-image/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            🔧 Ferramenta para redimensionar imagens
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Selecionar arquivo de imagem"
                    />
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Fazendo upload...
                      </div>
                    )}
                    {formData.imageUrl && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Imagem carregada com sucesso!
                        </div>
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-100 border border-green-200">
                          <Image
                            src={formData.imageUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Ou cole a URL da imagem"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL do Link
                    </label>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texto do Link
                    </label>
                    <input
                      type="text"
                      value={formData.linkText}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Texto do botão"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordem
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Data de início"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Data de fim"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-describedby="isActive-description"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900" id="isActive-description">
                    Banner ativo
                  </label>
                </div>

                {/* Preview do Banner */}
                {formData.title && formData.imageUrl && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preview do Banner</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-gray-800 to-gray-900">
                        <Image
                          src={formData.imageUrl}
                          alt={formData.title}
                          fill
                          className="object-cover opacity-50"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                          <div className="max-w-2xl space-y-2">
                            {/* Subtitle */}
                            {formData.subtitle && (
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30">
                                  {formData.subtitle}
                                </span>
                              </div>
                            )}

                            {/* Title */}
                            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-2xl leading-tight">
                              {formData.title}
                            </h3>

                            {/* Description */}
                            {formData.description && (
                              <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 drop-shadow-lg">
                                {formData.description}
                              </p>
                            )}

                            {/* CTA Button */}
                            <div className="flex items-center gap-3 pt-1">
                              {formData.linkUrl ? (
                                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-sm">
                                  {formData.linkText || 'Saiba Mais'}
                                </button>
                              ) : (
                                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-sm">
                                  {formData.linkText || 'Saiba Mais'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Este é um preview aproximado de como o banner aparecerá na página inicial
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingBanner ? 'Atualizar' : 'Criar'} Banner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Dicas e Melhores Práticas */}
      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Dicas e Melhores Práticas
        </h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-blue-500">📐</span>
              Dimensões e Qualidade
            </h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Dimensões ideais:</strong> 1920 x 1080 pixels (proporção 16:9)</li>
              <li>• <strong>Resolução:</strong> 72 PPI para web</li>
              <li>• <strong>Formatos:</strong> JPG (fotos), PNG (transparência), WebP (otimizado)</li>
              <li>• <strong>Tamanho:</strong> Máximo 5MB para carregamento rápido</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-green-500">✍️</span>
              Conteúdo e Textos
            </h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Título:</strong> Máximo 60 caracteres para melhor legibilidade</li>
              <li>• <strong>Subtítulo:</strong> Use para categorias ou destaques</li>
              <li>• <strong>Descrição:</strong> Máximo 150 caracteres para não sobrecarregar</li>
              <li>• <strong>Botão:</strong> Texto claro e ação específica (ex: "Leia Agora")</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-purple-500">🎨</span>
              Design e Visual
            </h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Contraste:</strong> Texto branco sobre fundo escuro funciona melhor</li>
              <li>• <strong>Hierarquia:</strong> Título maior que subtítulo, que é maior que descrição</li>
              <li>• <strong>Espaçamento:</strong> Deixe espaço para o texto não ficar sobrecarregado</li>
              <li>• <strong>Mobile:</strong> Teste como fica em telas pequenas</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-orange-500">⚡</span>
              Performance e SEO
            </h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Otimização:</strong> Comprima imagens antes do upload</li>
              <li>• <strong>Alt Text:</strong> Sempre preencha o título para acessibilidade</li>
              <li>• <strong>Links:</strong> Use URLs absolutas (https://) para links externos</li>
              <li>• <strong>Agendamento:</strong> Use datas para campanhas temporárias</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-blue-600">🔧</span>
              Ferramentas Úteis
            </h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Para redimensionar imagens:</strong></p>
              <div className="space-y-1">
                <a href="https://www.canva.com/create/resize-image/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline">
                  • Canva - Redimensionador de Imagens
                </a>
                <a href="https://tinypng.com/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline">
                  • TinyPNG - Compressor de Imagens
                </a>
                <a href="https://www.remove.bg/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline">
                  • Remove.bg - Remover Fundo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
