import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMetricsGeneration() {
  console.log('🧪 Testando geração de métricas...\n');

  try {
    // Buscar algumas histórias para testar
    const stories = await prisma.story.findMany({
      take: 3,
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
      console.log('❌ Nenhuma história encontrada no banco de dados');
      return;
    }

    console.log('📊 Dados ANTES da geração:');
    stories.forEach((story, index) => {
      console.log(`\n${index + 1}. ${story.title}`);
      console.log(`   Leituras: ${story.readsTotal.toLocaleString()}`);
      console.log(`   Nota: ${story.ratingAvg}`);
      console.log(`   Likes: ${story.likesTotal.toLocaleString()}`);
      console.log(`   Hot Score: ${story.hotScore}`);
      console.log(`   Manual Rating: ${story.manualRating || 'N/A'}`);
    });

    // Simular a geração de métricas
    const generateReadsTotal = (): number => {
      const rand = Math.random();
      if (rand < 0.7) {
        return Math.floor(Math.random() * (5000000 - 500000) + 500000);
      } else if (rand < 0.95) {
        return Math.floor(Math.random() * (15000000 - 5000000) + 5000000);
      } else {
        return Math.floor(Math.random() * (19700000 - 15000000) + 15000000);
      }
    };

    const generateRating = (): number => {
      const rand = Math.random();
      if (rand < 0.6) {
        return Number((Math.random() * (4.7 - 4.2) + 4.2).toFixed(1));
      } else if (rand < 0.9) {
        return Number((Math.random() * (4.9 - 4.7) + 4.7).toFixed(1));
      } else {
        return Number((Math.random() * (5.0 - 4.9) + 4.9).toFixed(1));
      }
    };

    const generateLikesTotal = (readsTotal: number): number => {
      const likeRate = Math.random() * (0.03 - 0.01) + 0.01;
      return Math.floor(readsTotal * likeRate);
    };

    const calculateHotScore = (readsTotal: number, rating: number, likesTotal: number): number => {
      const readsScore = Math.log10(readsTotal + 1) * 100;
      const ratingScore = rating * 20;
      const likesScore = Math.log10(likesTotal + 1) * 50;
      return Number((readsScore + ratingScore + likesScore).toFixed(2));
    };

    // Gerar novos dados
    const newData = stories.map(story => {
      const readsTotal = generateReadsTotal();
      const rating = generateRating();
      const likesTotal = generateLikesTotal(readsTotal);
      const ratingCount = Math.floor(readsTotal * (Math.random() * (0.02 - 0.005) + 0.005));
      const hotScore = calculateHotScore(readsTotal, rating, likesTotal);

      return {
        id: story.id,
        title: story.title,
        readsTotal,
        ratingAvg: rating,
        ratingCount,
        likesTotal,
        hotScore,
        manualRating: rating
      };
    });

    console.log('\n📈 Dados APÓS a geração:');
    newData.forEach((story, index) => {
      console.log(`\n${index + 1}. ${story.title}`);
      console.log(`   Leituras: ${story.readsTotal.toLocaleString()}`);
      console.log(`   Nota: ${story.ratingAvg}`);
      console.log(`   Likes: ${story.likesTotal.toLocaleString()}`);
      console.log(`   Hot Score: ${story.hotScore}`);
      console.log(`   Manual Rating: ${story.manualRating}`);
    });

    // Calcular estatísticas
    const avgReads = Math.floor(newData.reduce((sum, s) => sum + s.readsTotal, 0) / newData.length);
    const avgRating = Number((newData.reduce((sum, s) => sum + s.ratingAvg, 0) / newData.length).toFixed(1));
    const avgLikes = Math.floor(newData.reduce((sum, s) => sum + s.likesTotal, 0) / newData.length);
    const avgHotScore = Number((newData.reduce((sum, s) => sum + s.hotScore, 0) / newData.length).toFixed(2));

    console.log('\n📊 Estatísticas geradas:');
    console.log(`   Média de Leituras: ${avgReads.toLocaleString()}`);
    console.log(`   Média de Nota: ${avgRating}`);
    console.log(`   Média de Likes: ${avgLikes.toLocaleString()}`);
    console.log(`   Média Hot Score: ${avgHotScore}`);

    console.log('\n✅ Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMetricsGeneration();
