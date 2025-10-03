import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST - Reordenar banners
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bannerOrders } = body; // Array de { id, order }

    if (!Array.isArray(bannerOrders)) {
      return NextResponse.json(
        { error: "bannerOrders deve ser um array" },
        { status: 400 }
      );
    }

    // Atualizar a ordem de todos os banners em uma transação
    const updatePromises = bannerOrders.map(({ id, order }) =>
      prisma.banner.update({
        where: { id },
        data: { order }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: "Ordem dos banners atualizada com sucesso",
      updated: bannerOrders.length
    });
  } catch (error) {
    console.error("Erro ao reordenar banners:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
