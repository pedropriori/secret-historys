export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-3">
        <h2 className="font-semibold">Admin</h2>
        <nav className="text-sm grid gap-2">
          <a href="/admin">Dashboard</a>
          <a href="/admin/stories">Obras</a>
          <a href="/admin/metrics">Métricas</a>
          <a href="/admin/import">Importar</a>
          <a href="/admin/import-pdf">Importar PDF</a>
        </nav>
      </aside>
      <main className="p-4">{children}</main>
    </div>
  );
}




