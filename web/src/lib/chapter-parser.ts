/**
 * Utilitários para parsing e sequenciamento de capítulos na importação ZIP
 */

export interface ChapterInfo {
  number: number;
  title: string;
  content: string;
  filename: string;
}

/**
 * Extrai o número do capítulo do nome do arquivo
 * Suporta vários formatos: 001.md, 1.md, capitulo-1.md, etc.
 */
export function extractChapterNumber(filename: string): number | null {
  // Remove extensão e path
  const name = filename.split('/').pop()?.replace(/\.md$/i, '') || '';

  // Padrões suportados (em ordem de prioridade):
  const patterns = [
    /^(\d+)$/,                    // 001, 1, 2, 3
    /^capitulo[_-]?(\d+)$/i,      // capitulo-1, capitulo_1, capitulo1
    /^chapter[_-]?(\d+)$/i,       // chapter-1, chapter_1, chapter1
    /^cap[_-]?(\d+)$/i,           // cap-1, cap_1, cap1
    /^(\d+)[_-].*$/,              // 1-titulo, 001-introducao
    /^.*[_-](\d+)$/,              // titulo-1, introducao-001
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

/**
 * Extrai o título do capítulo do conteúdo Markdown
 * Procura por # Título na primeira linha não vazia
 */
export function extractChapterTitle(content: string): string {
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      // Remove # e espaços do início
      const title = trimmed.replace(/^#+\s*/, '').trim();
      if (title) {
        return title;
      }
    }
  }

  return '';
}

/**
 * Processa uma lista de arquivos de capítulos e retorna informações ordenadas
 */
export function processChapterFiles(entries: Array<{ entryName: string; content: string }>): ChapterInfo[] {
  const chapters: Array<ChapterInfo & { originalIndex: number }> = [];

  // Processa cada arquivo
  entries.forEach((entry, index) => {
    const filename = entry.entryName;
    const content = entry.content;

    // Extrai número do capítulo
    const chapterNumber = extractChapterNumber(filename);

    // Extrai título do conteúdo
    const title = extractChapterTitle(content);

    chapters.push({
      number: chapterNumber || (index + 1), // Fallback para índice + 1
      title: title || `Capítulo ${chapterNumber || (index + 1)}`,
      content,
      filename,
      originalIndex: index
    });
  });

  // Ordena por número do capítulo, depois por índice original
  chapters.sort((a, b) => {
    if (a.number !== b.number) {
      return a.number - b.number;
    }
    return a.originalIndex - b.originalIndex;
  });

  // Renumera sequencialmente para evitar duplicatas
  const finalChapters: ChapterInfo[] = [];
  let currentNumber = 1;

  for (const chapter of chapters) {
    finalChapters.push({
      number: currentNumber,
      title: chapter.title,
      content: chapter.content,
      filename: chapter.filename
    });
    currentNumber++;
  }

  return finalChapters;
}

/**
 * Valida se um arquivo é um capítulo válido
 */
export function isValidChapterFile(filename: string): boolean {
  // Aceita arquivos .md na pasta chapters/ ou na raiz do ZIP
  return (filename.startsWith('chapters/') || !filename.includes('/')) && filename.endsWith('.md');
}
