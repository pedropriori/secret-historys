import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Tipo de arquivo não permitido. Use JPG, PNG ou WebP",
          details: {
            received: file.type,
            allowed: allowedTypes
          }
        },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "Arquivo muito grande. Máximo 5MB",
          details: {
            received: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
            maxAllowed: "5MB"
          }
        },
        { status: 400 }
      );
    }

    // Validar tamanho mínimo (pelo menos 100KB)
    const minSize = 100 * 1024; // 100KB
    if (file.size < minSize) {
      return NextResponse.json(
        {
          error: "Arquivo muito pequeno. Mínimo 100KB",
          details: {
            received: `${(file.size / 1024).toFixed(2)}KB`,
            minRequired: "100KB"
          }
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop();
    const fileName = `${randomUUID()}.${fileExtension}`;

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), "public", "uploads", "banners");
    await mkdir(uploadDir, { recursive: true });

    // Salvar arquivo
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Retornar URL do arquivo
    const fileUrl = `/uploads/banners/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName,
      originalName: file.name,
      size: file.size,
      sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      type: file.type,
      message: "Upload realizado com sucesso!",
      recommendations: {
        idealDimensions: "1920 x 1080 pixels (16:9)",
        maxSize: "5MB",
        supportedFormats: ["JPG", "PNG", "WebP"]
      }
    });

  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
