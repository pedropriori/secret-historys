import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Buscar banners ativos para o frontend
export async function GET() {
  try {
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: { gte: now } }
            ]
          },
          {
            AND: [
              { startDate: null },
              { endDate: null }
            ]
          },
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: null }
            ]
          },
          {
            AND: [
              { startDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Erro ao buscar banners ativos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
