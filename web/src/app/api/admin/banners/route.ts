import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Listar todos os banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Erro ao buscar banners:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo banner
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, subtitle, description, imageUrl, linkUrl, linkText, isActive, order, startDate, endDate } = body;

    // Validações básicas
    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Título e URL da imagem são obrigatórios" },
        { status: 400 }
      );
    }

    // Se não foi fornecido order, pegar o próximo número
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxOrder = await prisma.banner.aggregate({
        _max: { order: true }
      });
      finalOrder = (maxOrder._max.order || 0) + 1;
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        linkUrl: linkUrl || null,
        linkText: linkText || null,
        isActive: isActive !== false, // default true
        order: finalOrder,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar banner:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
