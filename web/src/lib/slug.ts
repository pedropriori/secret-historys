/**
 * Gera um slug único baseado no título
 * @param title - Título da obra
 * @returns Slug único gerado automaticamente
 */
export function createSlug(title: string): string {
  // Normaliza o título removendo acentos e caracteres especiais
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/(^-|-$)+/g, ""); // Remove hífens do início e fim

  // Adiciona um sufixo aleatório para garantir unicidade
  const randomSuffix = Math.random().toString(36).substr(2, 6);

  return `${normalized}-${randomSuffix}`;
}

/**
 * Valida se um slug está no formato correto
 * @param slug - Slug para validar
 * @returns true se o slug é válido
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
}
