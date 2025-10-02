# Secret Historys — Guia da Área Admin (CRUD + Importação em Lote)
_Plataforma web mobile-first para leitura de histórias/novelas — design elegante inspirado em Buenovela e Dreame_

**Paleta base**: Rosa primária `#CE7F78` · Sépia leitura `#EAE3D9`  
**Stack**: Next.js (App Router, TS) · Tailwind + shadcn/ui · Prisma · Supabase (Postgres + Storage) · Vercel

---

## 📌 Contexto
- Usuários finais **leem sem login**; **somente admins** gerenciam conteúdos.  
- Conteúdo: **Obras/Histórias** (metadados, capa, status), **Capítulos** (Markdown), **Categorias** e **Tags**.  
- Já temos: setup do projeto, schema Prisma básico, FTS em espanhol configurado, páginas públicas iniciais.  
- Agora vamos criar a **Área Admin** com **CRUD completo** e **importação em lote** (ZIP contendo story.json + capítulos).

---

## 🎯 Objetivos desta entrega
1. **Segurança (Fase 1)**: proteger rotas/admin com `x-admin-token` (MVP rápido) e validação de entrada com **Zod**.  
2. **UI Admin** (Next + Tailwind + shadcn): listar, criar, editar e excluir **Obras**; gerenciar **Capítulos**.  
3. **Importador ZIP**: idempotente, rápido, capaz de processar **100–300 capítulos** em uma operação.  
4. **Infra**: upload de capa para **Supabase Storage**, transações atômicas no Prisma, logs básicos.  
5. **Próximos**: evoluir para **RLS + Supabase Auth** (Fase 2), permissões refinadas, auditoria.

---

## 🧱 Modelos & Migrações (Ajustes)
Mantemos o schema base e adicionamos controle de importação:

```prisma
// prisma/schema.prisma (adicionar ao final)
model ImportJob {
  id        String   @id @default(cuid())
  checksum  String   @unique
  storyId   String?
  status    String   // PENDING | DONE | ERROR
  message   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

> **Rodar migração**:
```bash
pnpm prisma migrate dev -n add_import_job
pnpm prisma generate
```

---

## 🔐 Segurança (Fase 1 — MVP)
**Objetivo**: habilitar rapidamente a área admin sem Auth complexa.  
- Use um header **`x-admin-token`** com valor secreto definido no `.env`.  
- Valide nas **API routes** e no **middleware** para `/admin`.

**.env.local**
```env
ADMIN_TOKEN=coloque-um-token-forte-aqui
SUPABASE_SERVICE_ROLE_KEY=... # somente no server
```

**src/middleware.ts**
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return;
  const cookie = req.cookies.get("admin_auth")?.value;
  if (!cookie) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

**Login simples (temporário)** — `src/app/admin/login/page.tsx`
```tsx
"use client";
import { useState } from "react";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (res.ok) window.location.href = "/admin";
    else alert("Token inválido");
  }
  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="text-xl font-semibold mb-4">Admin — Acesso</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input value={token} onChange={e=>setToken(e.target.value)} placeholder="Admin token" className="w-full border rounded p-2"/>
        <button className="w-full rounded bg-[var(--color-primary)] text-white py-2">Entrar</button>
      </form>
    </div>
  );
}
```

**API** — `src/app/api/admin/login/route.ts`
```ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", "ok", { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  return res;
}
```

> **Fase 2**: Supabase Auth + RLS + claims `role=admin` nas policies.

---

## 🧭 Navegação Admin (UX)
**Rotas**: `/admin`, `/admin/stories`, `/admin/stories/new`, `/admin/stories/[id]`, `/admin/import`, `/admin/login`

**Layout** — `src/app/admin/layout.tsx`
```tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-3">
        <h2 className="font-semibold">Admin</h2>
        <nav className="text-sm grid gap-2">
          <a href="/admin">Dashboard</a>
          <a href="/admin/stories">Obras</a>
          <a href="/admin/import">Importar</a>
        </nav>
      </aside>
      <main className="p-4">{children}</main>
    </div>
  );
}
```

---

## 🧰 Helpers
**Slugify** — `src/lib/slugify.ts`
```ts
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
```

**Storage (Supabase) — server only** — `src/lib/storage.ts`
```ts
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function uploadCoverFromBuffer(slug: string, buf: Buffer, mime = "image/jpeg") {
  const path = `covers/${slug}.${mime.includes("png") ? "png" : "jpg"}`;
  const { error } = await supabaseAdmin.storage.from(process.env.SUPABASE_COVERS_BUCKET || "covers")
    .upload(path, buf, { upsert: true, contentType: mime });
  if (error) throw error;
  const { data } = supabaseAdmin.storage.from(process.env.SUPABASE_COVERS_BUCKET || "covers").getPublicUrl(path);
  return data.publicUrl;
}
```

---

## 📄 Schemas (Zod) — `src/lib/schemas.ts`
```ts
import { z } from "zod";

export const StoryBaseSchema = z.object({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  language: z.enum(["es","pt","en"]).default("es"),
  status: z.enum(["ONGOING","COMPLETED","HIATUS"]),
  description: z.string().min(10),
  coverUrl: z.string().url().optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  author: z.object({ penName: z.string().min(2) }),
});
export type StoryBase = z.infer<typeof StoryBaseSchema>;

export const ChapterSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().optional(),
  contentMd: z.string().min(1),
  isPublished: z.boolean().default(true),
});

export const StoryImportSchema = StoryBaseSchema.extend({
  coverFile: z.string().optional(),
});
```

---

## 🔌 APIs Admin (route handlers)

**Auth helper** — `src/lib/admin-auth.ts`
```ts
import { NextResponse } from "next/server";
export function requireAdmin(req: Request) {
  const token = (req.headers as any).get?.("x-admin-token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
```

### GET `/api/admin/stories`
Lista obras com filtros e paginação por cursor.
```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const unauthorized = requireAdmin(req); if (unauthorized) return unauthorized;
  const { searchParams } = new URL(req.url);
  const take = Number(searchParams.get("take") || 20);
  const cursor = searchParams.get("cursor") || undefined;
  const status = searchParams.get("status") || undefined;
  const query = searchParams.get("query")?.trim();

  const where: any = {};
  if (status) where.status = status;
  if (query) where.OR = [{ title: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }];

  const items = await prisma.story.findMany({
    where,
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { updatedAt: "desc" },
    include: { author: true, _count: { select: { chapters: true } } },
  });
  const nextCursor = items.length === take ? items[items.length - 1].id : null;
  return NextResponse.json({ items, nextCursor });
}
```

### POST `/api/admin/stories`
Cria obra + categorias/tags.
```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { StoryBaseSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const unauthorized = requireAdmin(req); if (unauthorized) return unauthorized;
  const data = StoryBaseSchema.parse(await req.json());

  const author = await prisma.author.upsert({
    where: { penName: data.author.penName },
    update: {},
    create: { penName: data.author.penName },
  });

  const story = await prisma.story.create({
    data: {
      title: data.title, slug: data.slug, description: data.description,
      language: data.language, status: data.status, coverUrl: data.coverUrl,
      authorId: author.id,
    },
  });

  for (const name of data.categories) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const cat = await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
    await prisma.storyCategory.create({ data: { storyId: story.id, categoryId: cat.id } });
  }
  for (const name of data.tags) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
    await prisma.storyTag.create({ data: { storyId: story.id, tagId: tag.id } });
  }

  return NextResponse.json({ story });
}
```

### PUT/DELETE `/api/admin/stories/[id]`
Atualiza metadados ou exclui obra.
```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { StoryBaseSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(req); if (unauthorized) return unauthorized;
  const data = StoryBaseSchema.partial().parse(await req.json());

  let authorId: string | undefined;
  if (data.author?.penName) {
    const author = await prisma.author.upsert({ where: { penName: data.author.penName }, update: {}, create: { penName: data.author.penName } });
    authorId = author.id;
  }

  const story = await prisma.story.update({
    where: { id: params.id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description && { description: data.description }),
      ...(data.language && { language: data.language }),
      ...(data.status && { status: data.status }),
      ...(data.coverUrl && { coverUrl: data.coverUrl }),
      ...(authorId && { authorId }),
    },
  });

  return NextResponse.json({ story });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(_) as any; if (unauthorized) return unauthorized;
  const story = await prisma.story.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true, id: story.id });
}
```

### POST `/api/admin/stories/[id]/chapters/bulk`
Cria/atualiza capítulos em lote.
```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const BulkChaptersSchema = z.object({
  chapters: z.array(z.object({
    number: z.number().int().positive(),
    title: z.string().optional(),
    contentMd: z.string().min(1),
    isPublished: z.boolean().default(true),
  })).min(1)
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(req); if (unauthorized) return unauthorized;
  const { chapters } = BulkChaptersSchema.parse(await req.json());

  const data = chapters.map(c => ({
    storyId: params.id,
    number: c.number,
    title: c.title ?? `Capítulo ${c.number}`,
    contentMd: c.contentMd,
    lengthChars: c.contentMd.length,
    isPublished: c.isPublished,
  }));

  await prisma.$transaction(
    data.map(d => prisma.chapter.upsert({ where: { storyId_number: { storyId: d.storyId, number: d.number } }, update: d, create: d }))
  );

  return NextResponse.json({ ok: true, count: data.length });
}
```

### POST `/api/admin/upload/cover` (multipart)
Upload de capa para Supabase Storage.
```ts
import { NextResponse } from "next/server";
import { uploadCoverFromBuffer } from "@/lib/storage";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const unauthorized = requireAdmin(req); if (unauthorized) return unauthorized;
  const form = await req.formData();
  const slug = String(form.get("slug") || "");
  const file = form.get("file") as File | null;
  if (!slug || !file) return NextResponse.json({ error: "missing slug or file" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const url = await uploadCoverFromBuffer(slug, buf, file.type || "image/jpeg");
  return NextResponse.json({ url });
}
```

### POST `/api/admin/import` (ZIP)
Processa o ZIP e cria tudo de uma vez.
```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import AdmZip from "adm-zip";
import crypto from "crypto";
import { StoryImportSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadCoverFromBuffer } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const unauthorized = requireAdmin(req); if (unauthorized) return unauthorized;
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "ZIP faltando" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const checksum = crypto.createHash("sha1").update(buf).digest("hex");

  const existing = await prisma.importJob.findUnique({ where: { checksum } });
  if (existing?.status === "DONE") return NextResponse.json({ ok: true, reused: true, storyId: existing.storyId });

  const job = await prisma.importJob.create({ data: { checksum, status: "PENDING" } });

  try {
    const zip = new AdmZip(buf);
    const storyJsonEntry = zip.getEntry("story.json");
    if (!storyJsonEntry) throw new Error("story.json não encontrado");
    const rawJson = zip.readAsText(storyJsonEntry);
    const meta = StoryImportSchema.parse(JSON.parse(rawJson));

    let coverUrl: string | undefined = undefined;
    if (meta.coverFile && zip.getEntry(meta.coverFile)) {
      const cbuf = zip.readFile(meta.coverFile)!;
      coverUrl = await uploadCoverFromBuffer(meta.slug, Buffer.from(cbuf), "image/jpeg");
    }

    const author = await prisma.author.upsert({ where: { penName: meta.author.penName }, update: {}, create: { penName: meta.author.penName } });

    const story = await prisma.story.create({
      data: {
        title: meta.title, slug: meta.slug, description: meta.description, language: meta.language,
        status: meta.status, coverUrl, authorId: author.id,
      },
    });

    // categorias/tags
    for (const name of meta.categories ?? []) {
      const slug = name.toLowerCase().replace(/\s+/g,"-");
      const cat = await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
      await prisma.storyCategory.create({ data: { storyId: story.id, categoryId: cat.id } });
    }
    for (const name of meta.tags ?? []) {
      const slug = name.toLowerCase().replace(/\s+/g,"-");
      const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
      await prisma.storyTag.create({ data: { storyId: story.id, tagId: tag.id } });
    }

    // capítulos
    const entries = zip.getEntries()
      .filter(e => e.entryName.startsWith("chapters/") && e.entryName.endsWith(".md"))
      .sort((a,b) => a.entryName.localeCompare(b.entryName));

    // chunking opcional para > 100 capítulos
    await prisma.$transaction(entries.map((e, idx) => {
      const md = zip.readAsText(e);
      const num = parseInt(e.entryName.split("/").pop()!.replace(".md",""), 10) || (idx+1);
      const title = md.split("\n")[0].replace(/^#\s*/,"") || `Capítulo ${num}`;
      return prisma.chapter.create({
        data: { storyId: story.id, number: num, title, contentMd: md, lengthChars: md.length, isPublished: true }
      });
    }));

    await prisma.importJob.update({ where: { id: job.id }, data: { status: "DONE", storyId: story.id } });
    return NextResponse.json({ ok: true, storyId: story.id, chapters: entries.length });
  } catch (err: any) {
    await prisma.importJob.update({ where: { id: job.id }, data: { status: "ERROR", message: String(err?.message || err) } });
    return NextResponse.json({ error: "import_failed", detail: String(err?.message || err) }, { status: 400 });
  }
}
```

---

## ✅ Aceite & Testes
- CRUD completo de Obras e Capítulos (incl. lote).  
- Import ZIP idempotente, relatório com `storyId` e total de capítulos.  
- Upload de capa funcional (URL pública).  
- Validações de entrada com Zod, feedback na UI.  
- Proteção com `x-admin-token` e login temporário por cookie.

**E2E sugeridos (Playwright)**: login, criar obra, importar ZIP (200+ capítulos), editar obra, apagar obra, abrir obra pública.

---

## 🔜 Fase 2 (Segurança & Escala)
- Supabase Auth para admins + **RLS/Policies** (SELECT público, WRITE admin).  
- AuditLog e versões de capítulo.  
- Rate limiting e métricas de performance de import.  
- Jobs de hot/recommendations após import.

---

### Conclusão
Com esta especificação e exemplos, você pode implementar rapidamente a **Área Admin** do Secret Historys, garantindo produtividade (import em lote), segurança mínima (Fase 1) e base sólida para evoluções (Fase 2).