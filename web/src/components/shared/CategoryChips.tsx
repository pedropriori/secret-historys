import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Category { id: string; name: string; slug: string }

export async function CategoryChips() {
  let categories: Category[] = [];

  try {
    categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return null;
  }

  if (!categories?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c: Category) => (
        <Link key={c.id} href={`/categoria/${c.slug}`} className="px-3 py-1 rounded-full border text-sm hover:bg-neutral-50">
          {c.name}
        </Link>
      ))}
    </div>
  );
}

export default CategoryChips;




