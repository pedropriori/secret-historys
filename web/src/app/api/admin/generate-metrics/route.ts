import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Função para gerar número aleatório entre min e max
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Função para gerar número de leituras com distribuição realística
function generateReadsTotal(): number {
  // 70% chance de ser entre 500K-5M, 25% chance de ser entre 5M-15M, 5% chance de ser entre 15M-19.7M
  const rand = Math.random();
  
  if (rand < 0.7) {
    return Math.floor(randomBetween(500000, 5000000));
  } else if (rand < 0.95) {
    return Math.floor(randomBetween(5000000, 15000000));
  } else {
    return Math.floor(randomBetween(15000000, 19700000));
  }
}

// Função para gerar nota com distribuição realística
function generateRating(): number {
  // 60% chance de ser entre 4.2-4.7, 30% chance de ser entre 4.7-4.9, 10% chance de ser entre 4.9-5.0
  const rand = Math.random();
  
  if (rand < 0.6) {
    return Number(randomBetween(4.2, 4.7).toFixed(1));
  } else if (rand < 0.9) {
    return Number(randomBetween(4.7, 4.9).toFixed(1));
  } else {
    return Number(randomBetween(4.9, 5.0).toFixed(1));
  }
}

// Função para gerar likes baseado nas leituras
function generateLikesTotal(readsTotal: number): number {
  // Aproximadamente 1-3% das leituras se tornam likes
  const likeRate = randomBetween(0.01, 0.03);
  return Math.floor(readsTotal * likeRate);
}

// Função para gerar contagem de avaliações baseado nas leituras
function generateRatingCount(readsTotal: number): number {
  // Aproximadamente 0.5-2% das leituras se tornam avaliações
  const ratingRate = randomBetween(0.005, 0.02);
  return Math.floor(readsTotal * ratingRate);
}

// Função para calcular hotScore baseado nas métricas
function calculateHotScore(readsTotal: number, rating: number, likesTotal: number): number {
  // Fórmula que combina leituras, nota e likes
  const readsScore = Math.log10(readsTotal + 1) * 100;
  const ratingScore = rating * 20;
  const likesScore = Math.log10(likesTotal + 1) * 50;
  
  return Number((readsScore + ratingScore + likesScore).toFixed(2));
}

export async function POST() {
  try {
    // Buscar todas as histórias
    const stories = await prisma.story.findMany({
      select: {
        id: true,
        title: true,
        readsTotal: true,
        ratingAvg: true,
        ratingCount: true,
        likesTotal: true,
        hotScore: true,
        manualRating: true
      }
    });

    if (stories.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma história encontrada" },
        { status: 404 }
      );
    }

    // Gerar dados aleatórios para cada história
    const updates = stories.map(story => {
      const readsTotal = generateReadsTotal();
      const rating = generateRating();
      const likesTotal = generateLikesTotal(readsTotal);
      const ratingCount = generateRatingCount(readsTotal);
      const hotScore = calculateHotScore(readsTotal, rating, likesTotal);

      return {
        id: story.id,
        readsTotal,
        ratingAvg: rating,
        ratingCount,
        likesTotal,
        hotScore,
        manualRating: rating // Usar a mesma nota para manualRating
      };
    });

    // Atualizar todas as histórias em batch
    const updatePromises = updates.map(update =>
      prisma.story.update({
        where: { id: update.id },
        data: {
          readsTotal: update.readsTotal,
          ratingAvg: update.ratingAvg,
          ratingCount: update.ratingCount,
          likesTotal: update.likesTotal,
          hotScore: update.hotScore,
          manualRating: update.manualRating
        }
      })
    );

    await Promise.all(updatePromises);

    // Retornar estatísticas da atualização
    const stats = {
      totalStories: stories.length,
      avgReads: Math.floor(updates.reduce((sum, u) => sum + u.readsTotal, 0) / updates.length),
      avgRating: Number((updates.reduce((sum, u) => sum + u.ratingAvg, 0) / updates.length).toFixed(1)),
      avgLikes: Math.floor(updates.reduce((sum, u) => sum + u.likesTotal, 0) / updates.length),
      avgHotScore: Number((updates.reduce((sum, u) => sum + u.hotScore, 0) / updates.length).toFixed(2))
    };

    return NextResponse.json({
      success: true,
      message: `Métricas atualizadas para ${stories.length} histórias`,
      stats
    });

  } catch (error) {
    console.error("Erro ao gerar métricas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
