import Link from "next/link";

interface Category { id: string; name: string; slug: string }

export async function CategoryChips() {
  const res = await fetch(`${process.env.SITE_URL}/api/categories`, { next: { revalidate: 60 } });
  const { categories } = await res.json();

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




