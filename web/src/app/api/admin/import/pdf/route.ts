import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { StoryImportSchema } from "@/lib/schemas";
import { createSlug } from "@/lib/slug";
import { uploadCoverFromBuffer, uploadPdfToStorage } from "@/lib/storage";
import { sha1 } from "@/lib/pdf";

export const runtime = "nodejs";

export async function POST(req: Request) {
  console.log("📄 [PDF-IMPORT] Iniciando importação de PDF...");
  const unauthorized = await requireAdmin(req);
  if (unauthorized) {
    console.log("❌ [PDF-IMPORT] Falha na autenticação:", unauthorized);
    return unauthorized;
  }
  console.log("✅ [PDF-IMPORT] Autenticação aprovada, processando...");

  const form = await req.formData();
  const pdfFile = form.get("file") as File | null;
  const metaField = form.get("meta") as string | null;
  const coverFile = form.get("cover") as File | null;
  const coverUrlInput = form.get("coverUrl") as string | null;

  console.log("📄 [PDF-IMPORT] Dados recebidos:");
  console.log("📄 [PDF-IMPORT] PDF file:", pdfFile ? `${pdfFile.name} (${pdfFile.size} bytes)` : "não fornecido");
  console.log("📄 [PDF-IMPORT] Meta field:", metaField ? "fornecido" : "não fornecido");
  console.log("📄 [PDF-IMPORT] Cover file:", coverFile ? `${coverFile.name} (${coverFile.size} bytes)` : "não fornecido");
  console.log("📄 [PDF-IMPORT] Cover URL:", coverUrlInput || "não fornecido");

  if (!pdfFile) {
    console.log("❌ [PDF-IMPORT] Erro: PDF não fornecido");
    return NextResponse.json({ error: "PDF faltando" }, { status: 400 });
  }

  console.log("📄 [PDF-IMPORT] Iniciando processamento do PDF...");

  console.log("📄 [PDF-IMPORT] Convertendo PDF para buffer...");
  const pdfBuf = Buffer.from(await pdfFile.arrayBuffer());
  console.log("✅ [PDF-IMPORT] Buffer criado:", pdfBuf.length, "bytes");

  const checksum = sha1(pdfBuf);
  console.log("📄 [PDF-IMPORT] Checksum gerado:", checksum);

  console.log("📄 [PDF-IMPORT] Verificando importações existentes...");
  const existing = await prisma.importJob.findUnique({ where: { checksum } });
  console.log("📄 [PDF-IMPORT] Importação existente encontrada:", existing);

  if (existing?.status === "DONE" && existing.storyId) {
    console.log("✅ [PDF-IMPORT] Importação marcada como DONE, verificando se obra existe...");

    // Verificar se a obra realmente existe no banco
    const storyExists = await prisma.story.findUnique({
      where: { id: existing.storyId },
      include: { chapters: true }
    });

    if (storyExists) {
      console.log("✅ [PDF-IMPORT] Obra existe, reutilizando importação...");
      return NextResponse.json({
        ok: true,
        reused: true,
        storyId: existing.storyId,
        chapters: storyExists.chapters.length
      });
    } else {
      console.log("⚠️ [PDF-IMPORT] Obra não existe no banco, mas job está marcado como DONE. Recriando...");
      // Deletar o job incorreto e continuar com a importação
      await prisma.importJob.delete({ where: { id: existing.id } });
      console.log("✅ [PDF-IMPORT] Job incorreto deletado");
    }
  }

  if (existing?.status === "ERROR") {
    console.log("⚠️ [PDF-IMPORT] Importação anterior falhou, tentando novamente...");
    // Vamos deletar o job anterior e criar um novo
    await prisma.importJob.delete({ where: { id: existing.id } });
    console.log("✅ [PDF-IMPORT] Job anterior deletado");
  }

  console.log("📄 [PDF-IMPORT] Criando job de importação...");
  const job = await prisma.importJob.upsert({
    where: { checksum },
    update: { status: "PENDING", sourceType: "pdf" },
    create: { checksum, status: "PENDING", sourceType: "pdf" },
  });
  console.log("✅ [PDF-IMPORT] Job criado:", job.id);

  let sourcePdfUrl: string | undefined = undefined;

  try {
    console.log("📄 [PDF-IMPORT] Processando metadados...");
    let meta;

    if (metaField) {
      console.log("📄 [PDF-IMPORT] Usando metadados fornecidos");
      console.log("📄 [PDF-IMPORT] Meta field raw:", metaField);

      try {
        const parsedMeta = JSON.parse(metaField);
        console.log("📄 [PDF-IMPORT] Metadados parseados:", parsedMeta);
        meta = StoryImportSchema.parse(parsedMeta);
        console.log("✅ [PDF-IMPORT] Metadados validados com sucesso");
      } catch (parseError) {
        console.error("❌ [PDF-IMPORT] Erro ao parsear metadados:", parseError);
        throw new Error(`Erro ao processar metadados: ${parseError instanceof Error ? parseError.message : 'Erro desconhecido'}`);
      }
    } else {
      console.log("📄 [PDF-IMPORT] Usando metadados padrão");
      try {
        meta = StoryImportSchema.parse({
          title: pdfFile.name.replace(/\.pdf$/i, ""),
          language: "es",
          status: "ONGOING",
          description: "Historia importada desde archivo PDF. El contenido ha sido extraído y procesado automáticamente para su lectura en la plataforma.",
          author: { penName: "Anónimo" },
        });
        console.log("✅ [PDF-IMPORT] Metadados padrão validados");
      } catch (schemaError) {
        console.error("❌ [PDF-IMPORT] Erro ao validar metadados padrão:", schemaError);
        throw new Error(`Erro ao validar metadados: ${schemaError instanceof Error ? schemaError.message : 'Erro desconhecido'}`);
      }
    }

    console.log("✅ [PDF-IMPORT] Metadados validados:", meta);

    console.log("📄 [PDF-IMPORT] Processando slug...");
    let slug: string;

    if (meta.slug && meta.slug.trim()) {
      // Usar slug fornecido pelo usuário
      slug = meta.slug.trim();
      console.log("📄 [PDF-IMPORT] Usando slug fornecido:", slug);
    } else {
      // Gerar slug automaticamente
      slug = createSlug(meta.title);
      console.log("📄 [PDF-IMPORT] Slug gerado automaticamente:", slug);
    }

    // Validar se o slug está no formato correto
    if (!/^[a-z0-9-]+$/.test(slug)) {
      console.error("❌ [PDF-IMPORT] Slug inválido:", slug);
      throw new Error(`Slug inválido: ${slug}. Use apenas letras minúsculas, números e hífens.`);
    }

    console.log("✅ [PDF-IMPORT] Slug validado com sucesso:", slug);

    // Verificar se o slug já existe
    console.log("📄 [PDF-IMPORT] Verificando se slug já existe...");
    const existingStory = await prisma.story.findUnique({ where: { slug } });
    if (existingStory) {
      console.warn("⚠️ [PDF-IMPORT] Slug já existe, gerando novo slug...");
      slug = createSlug(meta.title);
      console.log("📄 [PDF-IMPORT] Novo slug gerado:", slug);
    }

    let coverUrl: string | undefined = undefined;

    // Processar capa (upload de arquivo ou URL)
    if (coverFile) {
      console.log("📄 [PDF-IMPORT] Processando capa via upload...");
      try {
        const cbuf = Buffer.from(await coverFile.arrayBuffer());
        coverUrl = await uploadCoverFromBuffer(slug, cbuf, coverFile.type || "image/jpeg");
        console.log("✅ [PDF-IMPORT] Capa enviada:", coverUrl);
      } catch (coverError) {
        console.warn("⚠️ [PDF-IMPORT] Erro ao enviar capa, continuando sem capa:", coverError);
        // Continue sem capa se houver erro
      }
    } else if (coverUrlInput && coverUrlInput.trim()) {
      console.log("📄 [PDF-IMPORT] Usando URL da capa fornecida:", coverUrlInput);
      coverUrl = coverUrlInput.trim();
    }

    console.log("📄 [PDF-IMPORT] Enviando PDF para Storage...");
    try {
      sourcePdfUrl = await uploadPdfToStorage(slug, pdfBuf, pdfFile.type || "application/pdf");
      console.log("✅ [PDF-IMPORT] PDF enviado:", sourcePdfUrl);
    } catch (pdfError) {
      console.warn("⚠️ [PDF-IMPORT] Erro ao enviar PDF, continuando sem armazenar:", pdfError);
      // Continue sem armazenar PDF se houver erro
    }

    console.log("📄 [PDF-IMPORT] Iniciando transação de importação...");

    // Usar transação para garantir atomicidade
    const result = await prisma.$transaction(async (tx) => {
      console.log("📄 [PDF-IMPORT] Criando capítulo único para PDF...");
      // Ao invés de extrair texto, vamos criar um capítulo único que referencia o PDF
      const chapterTitle = meta.title || "Leitura Completa";

      console.log("📄 [PDF-IMPORT] Criando autor...");
      console.log("📄 [PDF-IMPORT] Nome do autor:", meta.author.penName);
      const author = await tx.author.upsert({
        where: { penName: meta.author.penName },
        update: {},
        create: { penName: meta.author.penName }
      });
      console.log("✅ [PDF-IMPORT] Autor criado/encontrado:", author.id);

      console.log("📄 [PDF-IMPORT] Criando obra...");
      console.log("📄 [PDF-IMPORT] Dados da obra:", {
        title: meta.title,
        slug,
        description: meta.description,
        language: meta.language,
        status: meta.status,
        coverUrl,
        sourcePdfUrl,
        authorId: author.id,
      });

      const story = await tx.story.create({
        data: {
          title: meta.title,
          slug,
          description: meta.description,
          language: meta.language,
          status: meta.status as any,
          coverUrl,
          sourcePdfUrl,
          authorId: author.id,
          manualRating: meta.manualRating || null,
        },
      });
      console.log("✅ [PDF-IMPORT] Obra criada:", story.id);

      console.log("📄 [PDF-IMPORT] Processando categorias...");
      for (const name of meta.categories ?? []) {
        const slugCat = name.toLowerCase().replace(/\s+/g, "-");
        const cat = await tx.category.upsert({ where: { slug: slugCat }, update: {}, create: { name, slug: slugCat } });
        await tx.storyCategory.create({ data: { storyId: story.id, categoryId: cat.id } });
      }
      console.log("✅ [PDF-IMPORT] Categorias processadas:", meta.categories?.length || 0);

      console.log("📄 [PDF-IMPORT] Processando tags...");
      for (const name of meta.tags ?? []) {
        const slugTag = name.toLowerCase().replace(/\s+/g, "-");
        const tag = await tx.tag.upsert({ where: { slug: slugTag }, update: {}, create: { name, slug: slugTag } });
        await tx.storyTag.create({ data: { storyId: story.id, tagId: tag.id } });
      }
      console.log("✅ [PDF-IMPORT] Tags processadas:", meta.tags?.length || 0);

      console.log("📄 [PDF-IMPORT] Criando capítulo único...");

      // Criar um único capítulo que referencia o PDF
      const pdfChapterContent = `# ${chapterTitle}

Esta obra está disponível como um arquivo PDF completo. O visualizador abaixo permite ler diretamente no navegador, com controles otimizados para dispositivos móveis.

---

**📖 Como usar:**

- **Nova Aba:** Abre o PDF em tela cheia para melhor leitura
- **Baixar:** Salva o arquivo no seu dispositivo
- **Info:** Mostra detalhes da obra
- **Toque e arraste:** Navegue pelas páginas
- **Zoom:** Use gestos de pinça para ampliar

---

*Esta obra foi importada como PDF. Para a melhor experiência, use os controles do visualizador ou baixe o arquivo para leitura offline.*`;

      const chapterData = {
        storyId: story.id,
        number: 1,
        title: chapterTitle,
        contentMd: pdfChapterContent,
        lengthChars: pdfChapterContent.length,
        isPdfOnly: true, // Marcar como capítulo PDF
        isPublished: true,
      };

      console.log("📄 [PDF-IMPORT] Inserindo capítulo no banco...");
      console.log("📄 [PDF-IMPORT] Dados do capítulo:", chapterData);

      const createdChapter = await tx.chapter.create({ data: chapterData });
      console.log("✅ [PDF-IMPORT] Capítulo criado com sucesso:", createdChapter.id);

      // Retornar os dados da transação
      return {
        storyId: story.id,
        chapterId: createdChapter.id,
        chaptersCount: 1
      };
    });

    console.log("✅ [PDF-IMPORT] Transação concluída com sucesso:", result);

    console.log("📄 [PDF-IMPORT] Finalizando importação...");
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "DONE",
        storyId: result.storyId,
        payloadMeta: {
          chapters: result.chaptersCount,
          pdfUrl: sourcePdfUrl
        }
      }
    });
    console.log("✅ [PDF-IMPORT] Importação concluída com sucesso!");
    return NextResponse.json({
      ok: true,
      storyId: result.storyId,
      chapters: result.chaptersCount
    });
  } catch (err: any) {
    console.error("❌ [PDF-IMPORT] Erro na importação:", err);
    console.error("❌ [PDF-IMPORT] Stack trace:", err instanceof Error ? err.stack : undefined);

    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorDetail = {
      message: errorMessage,
      type: err.constructor?.name || 'UnknownError',
      timestamp: new Date().toISOString()
    };

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "ERROR",
        message: errorMessage,
        payloadMeta: { error: errorDetail }
      }
    });

    return NextResponse.json({
      error: "import_failed",
      detail: errorMessage,
      timestamp: errorDetail.timestamp
    }, { status: 400 });
  }
}


