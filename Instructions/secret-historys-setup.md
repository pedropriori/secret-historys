# Secret Historys — Setup Inicial (MVP)
_Plataforma web (mobile-first) para leitura de histórias/novelas — ES como idioma inicial_

> Este documento `.md` guia você e o Cursor Agent a criar **todo o setup inicial** do projeto seguindo **boas práticas** e a documentação oficial do ecossistema (Next.js, Prisma, Supabase, Tailwind, shadcn/ui). Vamos do zero até a aplicação rodando localmente, com banco de dados, busca FTS em espanhol e páginas base.  
> Na próxima etapa, evoluiremos design e funcionalidades passo a passo.

---

## Sumário
1. [Visão Geral & Decisões](#visão-geral--decisões)  
2. [Stack Técnica](#stack-técnica)  
3. [Pré-requisitos](#pré-requisitos)  
4. [Criar Projeto & Dependências](#criar-projeto--dependências)  
5. [Estrutura de Pastas](#estrutura-de-pastas)  
6. [Configuração Base (Next/Tailwind/shadcn)](#configuração-base-nexttailwindshadcn)  
7. [Supabase (DB/Storage) & Variáveis de Ambiente](#supabase-dbstorage--variáveis-de-ambiente)  
8. [Prisma (Schema, Client, Migrações)](#prisma-schema-client-migrações)  
9. [SQL Extra: FTS (espanhol) & Extensões](#sql-extra-fts-espanhol--extensões)  
10. [Seed inicial (dados de exemplo)](#seed-inicial-dados-de-exemplo)  
11. [UI Inicial (layout, home, card)](#ui-inicial-layout-home-card)  
12. [APIs Iniciais (stories/chapters)](#apis-iniciais-storieschapters)  
13. [PWA & SEO básicos](#pwa--seo-básicos)  
14. [Execução Local & Checklist](#execução-local--checklist)  
15. [Próximos Passos](#próximos-passos)  
16. [Notas de Boas Práticas](#notas-de-boas-práticas)

---

## Visão Geral & Decisões
- **Nome**: Secret Historys  
- **Público**: leitura aberta (sem login)  
- **Admin**: somente administradores cadastram obras/capítulos (via painel/admin)  
- **Idioma de UI**: **Espanhol (ES)** no MVP (pt-BR e EN depois)  
- **Design**: inspiração **Buenovela/Dreame**  
  - Primária (rosa): `#CE7F78`  
  - Leitura (sépia/off-white): `#EAE3D9`  
- **Hospedagem**: Vercel (app) + Supabase (DB/Storage)  
- **ORM**: Prisma  
- **Busca**: Postgres FTS (dicionário **espanhol**)  
- **Importação em lote**: estará no MVP (próximo passo após setup)  

---

## Stack Técnica
- **Next.js (App Router) + TypeScript** (SSR + RSC)  
- **TailwindCSS** + **shadcn/ui** (UI consistente, acessível, mobile-first)  
- **Supabase (Postgres + Storage)**  
- **Prisma** (ORM)  
- **FTS** em espanhol com `tsvector` + `GIN` + `unaccent`  
- **PWA** (manifest + base do service worker — evolução posterior)  
- **SEO** (sitemap/OG/metadata básicos)  

---

## Pré-requisitos
- **Node.js 18+** (recomendado 20+)  
- **PNPM** (recomendado) ou NPM/Yarn  
- Conta **Supabase** criada (vamos criar projeto e buckets)  
- (Opcional) Conta **Vercel** para deploy após o setup

---

## Criar Projeto & Dependências

```bash
# 1) Criar projeto Next.js (App Router, TS, Tailwind, src/ e alias @/*):
pnpm create next-app@latest secret-historys \
  --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"

cd secret-historys

# 2) Dependências de app
pnpm add @prisma/client prisma zod
pnpm add @supabase/supabase-js
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react
pnpm add next-sitemap
pnpm add reading-time
pnpm add react-markdown remark-gfm

# 3) shadcn/ui (utilitários UI)
pnpm dlx shadcn@latest init -d
# (siga prompts; path padrão "@/components/ui")
pnpm dlx shadcn@latest add button card badge input textarea dialog dropdown-menu sheet tabs skeleton

# 4) Tailwind plugins úteis
pnpm add -D @tailwindcss/typography @tailwindcss/line-clamp
```

> **Por quê:** Mantemos dependências enxutas e alinhadas com docs oficiais do Next/shadcn/Tailwind/Prisma/Supabase.  

---

## Estrutura de Pastas

```
secret-historys/
  src/
    app/
      api/
        stories/route.ts
        stories/[slug]/route.ts
        chapters/[slug]/[num]/route.ts
      obra/[slug]/page.tsx
      layout.tsx
      page.tsx
      manifest.webmanifest
    components/
      ui/              # (shadcn/ui)
      shared/
        StoryCard.tsx
    lib/
      prisma.ts
      supabase.ts
      i18n.ts
    styles/
      globals.css
    prisma/
      schema.prisma
  next-sitemap.config.js
  next.config.mjs
  tailwind.config.ts
  .env.example
```

---

## Configuração Base (Next/Tailwind/shadcn)

**`next.config.mjs`** (permitir imagens do Supabase, habilitar strict mode)
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

export default nextConfig;
```

**`tailwind.config.ts`** (cores, plugins)
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#CE7F78" },
        sepia: { DEFAULT: "#EAE3D9" },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
  ],
};
export default config;
```

**`src/styles/globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #CE7F78;
  --color-sepia: #EAE3D9;
}

html, body {
  @apply bg-white text-neutral-900 antialiased;
}

a {
  color: var(--color-primary);
}
```

**`src/lib/i18n.ts`** (ES padrão no MVP)
```ts
export const ES = {
  filters: {
    recommended: "Recomendados",
    hot: "En tendencia",
    mostRead: "Más leídos",
    completed: "Completos",
    categories: "Categorías",
  },
  story: {
    by: "por",
    status: { ONGOING: "En curso", COMPLETED: "Completo", HIATUS: "Hiato" },
    chapters: "Capítulos",
    read: "Leer",
  },
  reader: {
    next: "Siguiente",
    prev: "Anterior",
  },
};
export type Dict = typeof ES;
export const t = ES;
```

**`src/app/layout.tsx`** (layout base)
```tsx
import "@/styles/globals.css";

export const metadata = {
  title: "Secret Historys — Lectura sin límites",
  description: "Novelas, historias y capítulos en español.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div className="font-semibold tracking-wide">Secret Historys</div>
            <nav className="text-sm">
              <a href="/" className="px-3">Inicio</a>
              <a href="/#hot" className="px-3">En tendencia</a>
              <a href="/#completos" className="px-3">Completos</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
```

**`src/app/page.tsx`** (home placeholder)
```tsx
export default function Home() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Descubre historias irresistibles</h1>
      <p className="text-neutral-600">Pronto verás “En tendencia”, “Más leídos” y “Completos”.</p>
    </div>
  );
}
```

---

## Supabase (DB/Storage) & Variáveis de Ambiente

1) Crie um **projeto** no Supabase.  
2) Pegue `PROJECT_URL`, `ANON_KEY` e o `DATABASE_URL`.  
3) Crie **buckets** públicos no Storage: `covers` e `assets`.  
4) Crie `.env.example` e `.env.local`:

**`.env.example`**
```env
# Postgres (Supabase)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require

# Supabase client
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>

# Buckets (usaremos public URLs)
SUPABASE_COVERS_BUCKET=covers
SUPABASE_ASSETS_BUCKET=assets
```

> **Boas práticas**: não exponha **Service Role Key** no client. Quando precisarmos (rotas admin), usaremos server-side apenas, em variável segura.

**`src/lib/supabase.ts`**
```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);
```

---

## Prisma (Schema, Client, Migrações)

**`src/prisma/schema.prisma`**
```prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model Author {
  id        String   @id @default(cuid())
  penName   String   @unique
  bio       String?
  avatarUrl String?
  stories   Story[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Story {
  id           String    @id @default(cuid())
  title        String
  slug         String    @unique
  coverUrl     String?
  status       StoryStatus
  language     String    // "es" | "pt" | "en" ...
  description  String
  author       Author    @relation(fields: [authorId], references: [id])
  authorId     String
  categories   StoryCategory[]
  tags         StoryTag[]
  chapters     Chapter[]

  readsTotal   Int       @default(0)
  likesTotal   Int       @default(0)
  ratingAvg    Float     @default(0)
  ratingCount  Int       @default(0)
  hotScore     Float     @default(0)

  searchVector Unsupported("tsvector")?
  publishedAt  DateTime? @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([language, status, publishedAt])
  @@index([hotScore])
  @@index([readsTotal])
}

model Chapter {
  id          String   @id @default(cuid())
  story       Story    @relation(fields: [storyId], references: [id])
  storyId     String
  number      Int
  title       String?
  contentMd   String
  lengthChars Int
  isPublished Boolean  @default(true)
  publishedAt DateTime? @default(now())

  @@unique([storyId, number])
  @@index([storyId, number])
}

model Category {
  id     String @id @default(cuid())
  name   String @unique
  slug   String @unique
  stories StoryCategory[]
}

model StoryCategory {
  story      Story    @relation(fields: [storyId], references: [id])
  storyId    String
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId String

  @@id([storyId, categoryId])
}

model Tag {
  id     String @id @default(cuid())
  name   String @unique
  slug   String @unique
  stories StoryTag[]
}

model StoryTag {
  story   Story @relation(fields: [storyId], references: [id])
  storyId String
  tag     Tag   @relation(fields: [tagId], references: [id])
  tagId   String

  @@id([storyId, tagId])
}

model StoryDailyReads {
  id      String   @id @default(cuid())
  story   Story    @relation(fields: [storyId], references: [id])
  storyId String
  date    DateTime
  total   Int      @default(0)

  @@index([storyId, date])
}

enum StoryStatus {
  ONGOING
  COMPLETED
  HIATUS
}
```

**`src/lib/prisma.ts`**
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ["error", "warn"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Gerar e migrar**
```bash
pnpm prisma generate
pnpm prisma migrate dev -n init
```

---

## SQL Extra: FTS (espanhol) & Extensões
Abra o **SQL Editor** do Supabase e rode:

```sql
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- índice GIN p/ tsvector
create index if not exists stories_search_vector_idx
  on "Story" using GIN ("searchVector");

-- trigger para manter searchVector atualizado (dic. espanhol + unaccent)
create or replace function story_searchvector_update() returns trigger as $$
begin
  new."searchVector" :=
    to_tsvector('spanish',
      unaccent(coalesce(new.title,'')) || ' ' ||
      unaccent(coalesce(new.description,''))
    );
  return new;
end
$$ language plpgsql;

drop trigger if exists story_searchvector_tg on "Story";
create trigger story_searchvector_tg
before insert or update of title, description
on "Story"
for each row execute function story_searchvector_update();
```

> **Consulta FTS (exemplo)**:  
> `where "searchVector" @@ plainto_tsquery('spanish', unaccent($1))`

> **RLS no MVP**: manter **desativado** para tabelas públicas e proteger escrita via rotas admin (server-side). Ativaremos RLS com policies na etapa de Admin/Auth.

---

## Seed inicial (dados de exemplo)

**`package.json` (scripts úteis)**
```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

**Instale tsx para rodar seed em TS**
```bash
pnpm add -D tsx
mkdir -p scripts
```

**`scripts/seed.ts`**
```ts
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

  const ch1 = `# Capítulo 1
La noche olía a lluvia y a promesas rotas. ...`;

  const ch2 = `# Capítulo 2
Él apareció en silencio, como un secreto compartido por la luna. ...`;

  await prisma.chapter.createMany({
    data: [
      { storyId: story.id, number: 1, title: "Capítulo 1", contentMd: ch1, lengthChars: ch1.length },
      { storyId: story.id, number: 2, title: "Capítulo 2", contentMd: ch2, lengthChars: ch2.length },
    ],
    skipDuplicates: true,
  });

  console.log("Seed ok ✔");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
```

**Rodar seed**
```bash
pnpm db:seed
```

---

## UI Inicial (layout, home, card)

**`src/components/shared/StoryCard.tsx`**
```tsx
import { Story } from "@prisma/client";

export default function StoryCard({ story }: { story: Story }) {
  return (
    <a
      href={`/obra/${story.slug}`}
      className="group block rounded-xl overflow-hidden bg-white border shadow-sm hover:shadow-md transition"
    >
      <div className="aspect-[3/4] bg-neutral-100">
        {story.coverUrl ? (
          // Para produção, migraremos para next/image com domain configurado
          <img
            src={story.coverUrl}
            alt={story.title}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-3">
        <div className="text-sm text-neutral-500">{story.status}</div>
        <div className="font-semibold leading-tight line-clamp-2">
          {story.title}
        </div>
        <div className="text-xs text-neutral-600 mt-1">
          {story.readsTotal} lecturas
        </div>
      </div>
    </a>
  );
}
```

**`src/app/obra/[slug]/page.tsx`** (página da obra – esqueleto)
```tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const story = await prisma.story.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      _count: { select: { chapters: true } },
    },
  });
  if (!story) return notFound();

  const firstChapter = await prisma.chapter.findFirst({
    where: { storyId: story.id, isPublished: true },
    orderBy: { number: "asc" },
  });

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <article className="space-y-4">
        <h1 className="text-2xl font-bold">{story.title}</h1>
        <div className="text-sm text-neutral-600">
          por {story.author?.penName} • {story.language.toUpperCase()} • {story.status}
        </div>
        <p className="text-neutral-800">{story.description}</p>

        <a
          href={firstChapter ? `/chapters/${story.slug}/${firstChapter.number}` : "#"}
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white"
        >
          {firstChapter ? "Leer desde el inicio" : "Pronto disponible"}
        </a>
      </article>

      <aside className="space-y-3">
        <div className="text-sm text-neutral-700">
          Capítulos: <b>{story._count.chapters}</b>
        </div>
        {/* Blocos futuros: categorias, tags, relacionados */}
        <div className="text-sm text-neutral-500">Más contenidos pronto…</div>
      </aside>
    </div>
  );
}
```

---

## APIs Iniciais (stories/chapters)

**`src/app/api/stories/route.ts`** (lista de obras básica)
```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const stories = await prisma.story.findMany({
    take: 24,
    orderBy: { hotScore: "desc" },
  });
  return NextResponse.json({ stories });
}
```

**`src/app/api/stories/[slug]/route.ts`** (detalhe de obra)
```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const story = await prisma.story.findUnique({
    where: { slug: params.slug },
    include: { author: true },
  });
  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ story });
}
```

**`src/app/api/chapters/[slug]/[num]/route.ts`** (conteúdo do capítulo)
```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { slug: string; num: string } }
) {
  const story = await prisma.story.findUnique({ where: { slug: params.slug } });
  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const number = Number(params.num);
  const chapter = await prisma.chapter.findUnique({
    where: { storyId_number: { storyId: story.id, number } },
  });

  if (!chapter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ chapter });
}
```

---

## PWA & SEO básicos

**`src/app/manifest.webmanifest`**
```json
{
  "name": "Secret Historys",
  "short_name": "SecretHistorys",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#EAE3D9",
  "theme_color": "#CE7F78",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**`next-sitemap.config.js`**
```js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://secret-historys.example.com',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/api/*'],
};
```
Gerar (após build):
```bash
pnpm dlx next-sitemap
```

> **Observação**: adicione `icon-192.png` e `icon-512.png` em `public/` (podem ser placeholders por ora).

---

## Execução Local & Checklist

**Rodar localmente**
```bash
cp .env.example .env.local     # edite com dados do seu Supabase
pnpm install
pnpm prisma generate
pnpm prisma migrate dev -n init
pnpm db:seed
pnpm dev
```

**Checklist rápido**
- [ ] Projeto inicia em `http://localhost:3000`  
- [ ] Seed criou 1 autor, 1 obra e 2 capítulos  
- [ ] `GET /api/stories` retorna lista (JSON)  
- [ ] `GET /api/stories/el-secreto-del-alfa` retorna detalhe  
- [ ] `GET /api/chapters/el-secreto-del-alfa/1` retorna capítulo  
- [ ] Página `/obra/el-secreto-del-alfa` abre e exibe metadados básicos  
- [ ] Extensões/trigger FTS criadas no Supabase sem erro

---

## Próximos Passos
1. **Leitor** `/leer/[slug]/[num]` com tema sépia (#EAE3D9), tipografia confortável, próximo/anterior.  
2. **Home real**: seções “En tendencia”, “Más leídos”, “Completos” com consultas ao banco.  
3. **Busca** por FTS (endpoint `GET /api/search?q=` usando `searchVector @@ ...`).  
4. **Painel Admin** e **Importação ZIP** (story.json + chapters/*.md + cover.jpg).  
5. **Buckets & CDN** (confirmar políticas públicas do Storage e cache).  
6. **Job de HotScore** (pg_cron ou rota cron Vercel).  
7. **SEO**: sitemaps dinâmicos (obras/capítulos) e OG dinâmico.  
8. **RLS/Auth Admin** (ativar RLS, policies na DB e proteger rotas de escrita).  
9. **Design** (afinamento visual à la Buenovela/Dreame; shadcn tokens/temas).  

---

## Notas de Boas Práticas
- **Service Role Key**: nunca expor no cliente. Usar apenas em rotas **server-side** e, idealmente, migrar para **RLS + policies**.  
- **Migrations**: versionar `schema.prisma`; toda alteração via `prisma migrate`.  
- **Índices**: já previstos nos modelos; em carga real, monitore planos de consulta e crie índices adicionais.  
- **Acessibilidade**: componentes shadcn já ajudam; manter contraste e foco acessível.  
- **Perf**: paginar listas, buscar conteúdo de capítulos sob demanda, pré-buscar próximo capítulo no leitor.  
- **Mobile-first**: otimizar interações por toque, tamanhos de alvo, alturas de linha e largura de coluna de leitura.
