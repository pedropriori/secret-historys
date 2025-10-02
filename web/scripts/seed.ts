import { PrismaClient, StoryStatus } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const author = await prisma.author.upsert({
    where: { penName: "Luna Vega" },
    update: {},
    create: { penName: "Luna Vega" },
  });

  const story = await prisma.story.upsert({
    where: { slug: "el-secreto-del-alfa" },
    update: {},
    create: {
      title: "El Secreto del Alfa",
      slug: "el-secreto-del-alfa",
      description:
        "Una historia intensa de lobos alfa, celos y destinos cruzados.",
      language: "es",
      status: StoryStatus.ONGOING,
      authorId: author.id,
      readsTotal: 1234,
    },
  });

  const ch1 = `# Capítulo 1\nLa noche olía a lluvia y a promesas rotas. ...`;
  const ch2 = `# Capítulo 2\nÉl apareció en silencio, como un secreto compartido por la luna. ...`;

  await prisma.chapter.createMany({
    data: [
      { storyId: story.id, number: 1, title: "Capítulo 1", contentMd: ch1, lengthChars: ch1.length },
      { storyId: story.id, number: 2, title: "Capítulo 2", contentMd: ch2, lengthChars: ch2.length },
    ],
    skipDuplicates: true,
  });

  console.log("Seed ok ✔");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});




