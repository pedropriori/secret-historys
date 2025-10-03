import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Buscar banner específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      return NextResponse.json(
        { error: "Banner não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Erro ao buscar banner:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar banner
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, description, imageUrl, linkUrl, linkText, isActive, order, startDate, endDate, imagePositionX, imagePositionY, imageScale } = body;

    // Verificar se o banner existe
    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!existingBanner) {
      return NextResponse.json(
        { error: "Banner não encontrado" },
        { status: 404 }
      );
    }

    // Validações básicas
    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Título e URL da imagem são obrigatórios" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        linkUrl: linkUrl || null,
        linkText: linkText || null,
        isActive: isActive !== false,
        order: order !== undefined ? order : existingBanner.order,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        imagePositionX: imagePositionX !== undefined ? imagePositionX : existingBanner.imagePositionX,
        imagePositionY: imagePositionY !== undefined ? imagePositionY : existingBanner.imagePositionY,
        imageScale: imageScale !== undefined ? imageScale : existingBanner.imageScale,
      }
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Erro ao atualizar banner:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir banner
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se o banner existe
    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!existingBanner) {
      return NextResponse.json(
        { error: "Banner não encontrado" },
        { status: 404 }
      );
    }

    await prisma.banner.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Banner excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir banner:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
