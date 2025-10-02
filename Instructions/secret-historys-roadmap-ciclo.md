# Secret Historys — Roadmap Técnico de Próximos Passos (Ciclo Atual)

_Plataforma web mobile-first para leitura de histórias/novelas — design elegante inspirado em Buenovela e Dreame_  
**Paleta:** Rosa primária `#CE7F78` · Sépia leitura `#EAE3D9`

Este documento guia o **próximo ciclo de desenvolvimento** após concluir o setup inicial, Home/Leitor/Busca básicos e FTS. Traz **tarefas priorizadas**, instruções detalhadas, exemplos de implementação e boas práticas. Use-o no Cursor para conduzir as próximas PRs passo a passo.

---

## Visão Geral do Estado Atual

- ✅ Projeto Next.js (App Router, TS), Tailwind, shadcn/ui
- ✅ Supabase Postgres/Storage + Prisma
- ✅ Modelos base (Author, Story, Chapter, Category, Tag, StoryDailyReads)
- ✅ FTS em espanhol (`tsvector` + `GIN` + `unaccent`)
- ✅ Home e página de Obra (básicas), Leitor (básico), APIs iniciais
- 🔜 Falta polimento do Leitor, Seções reais na Home, Busca integrada, Admin/Importador ZIP, SEO avançado, PWA, RLS/Auth Admin, “Hot”, Recomendados e performance/caching

---

## Objetivos do Ciclo

1. **Polir o Leitor** (tema sépia, controles, progresso, prefetch)  
2. **Home real com seções dinâmicas** (Hot, Más leídos, Completos, Categorias)  
3. **Busca global integrada** (FTS + UI com autosuggest simples)  
4. **Painel Admin & Importador ZIP** (CRUD + importações idempotentes)  
5. **Hot score e “Recomendados”** (jobs/cron + caches)  
6. **SEO & PWA** (sitemap dinâmico, OG dinâmico, cache offline de capítulo)  
7. **Analytics & Observabilidade** (PostHog + Sentry)  -> futuro
8. **Segurança & RLS/Admin Auth** (policies, guard nas rotas)  
9. **Perf & Caching** (ISR, route caching, next/image/Storage loader)  
10. **Qualidade & CI** (tests, lint, preview deploys)

> Sugerimos seguir a ordem, mas cada tópico abaixo é independente com instruções e exemplos.

---

## 1) Leitor — Polimento e UX de Leitura

### Requisitos
- **Fundo sépia** (`#EAE3D9`) e tipografia confortável (UI: Inter · Leitura: Noto Serif)
- Ajustes de **tamanho de fonte**, **line-height**, **largura de coluna**
- Barra fixa com **Anterior / Próximo**; indicador de **progresso** (capítulo atual de total)
- **Prefetch** do capítulo seguinte; skeleton para carregamento
- **Persistência de preferências** (localStorage): `fontSize`, `lineHeight`, `fontFamily`, `theme` (sepia|light|dark)

### Estrutura
```
src/app/leer/[slug]/[num]/page.tsx
src/components/reader/ReaderControls.tsx
src/components/reader/ProgressBar.tsx
src/hooks/useReadingPrefs.ts
```

### Hook de preferências (exemplo)
```ts
// src/hooks/useReadingPrefs.ts
import { useEffect, useState } from "react";
type Prefs = { fontSize: number; lineHeight: number; font: "serif"|"sans"; theme: "sepia"|"light"|"dark" };
const DEFAULT: Prefs = { fontSize: 18, lineHeight: 1.8, font: "serif", theme: "sepia" };

export function useReadingPrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  useEffect(() => {
    try { const raw = localStorage.getItem("reader:prefs"); if (raw) setPrefs(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("reader:prefs", JSON.stringify(prefs)); }, [prefs]);
  return { prefs, setPrefs };
}
```

### Prefetch do próximo capítulo
No servidor, busque `prev/next` números; no cliente, faça `prefetch` do link “Siguiente” com `<Link prefetch />` do Next.

### Métrica de leitura
Registre “chapter_opened” e “chapter_completed” (≥90% do texto lido ou scroll no fim) — ver seção Analytics.

---

## 2) Home Real — Seções Dinâmicas e Descoberta

### Seções
- **En tendencia** → `orderBy: { hotScore: "desc" }`
- **Más leídos** → `orderBy: { readsTotal: "desc" }`
- **Completos** → `where: { status: "COMPLETED" }`
- **Categorías** → chips que levam para `/categoria/[slug]`
- Opcional: **Novedades** → `orderBy: { publishedAt: "desc" }`

### UI
- Carrosséis horizontais (scroll-x) em mobile; grade responsiva em desktop
- Cards com capa, status, título (2 linhas), lecturas
- Botão “Ver más” (leva para listagem filtrada)

### Endpoints
- `GET /api/stories?sort=hot|reads|recent&status=&take=&cursor=`
- `GET /api/categories` (para chips)

> Use paginação por cursor quando necessário (`take=12/24`), e memorização com Route Segment Caching.

---

## 3) Busca Global — FTS + UI

### API
```ts
// src/app/api/search/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ items: [] });

  // OBS: Prisma não tem operador FTS nativo -> use queryRaw
  const items = await prisma.$queryRawUnsafe<any[]>(`
    select id, title, slug, coverUrl, status, readsTotal,
           ts_rank("searchVector", plainto_tsquery('spanish', unaccent($1))) as rank
    from "Story"
    where "searchVector" @@ plainto_tsquery('spanish', unaccent($1))
    order by rank desc
    limit 20
  `, q);

  return NextResponse.json({ items });
}
```

### UI
- Barra fixa no Header (debounce 250ms)
- Lista de resultados (grid com `StoryCard`), empty state amigável
- Atalhos: `Enter` para buscar, `Esc` para limpar

---

## 4) Painel Admin & Importador ZIP

### Fluxos
- **Login Admin** (fase inicial: token secret e IP allowlist; fase seguinte: Supabase Auth + RLS)
- **CRUD**: Obras, Capítulos, Autores, Categorias, Tags
- **Importador ZIP** (idempotente): `story.json` + `chapters/*.md` + `cover.jpg`

### Especificação do `story.json`
```json
{
  "title": "El Secreto del Alfa",
  "slug": "el-secreto-del-alfa",
  "author": { "penName": "Luna Vega" },
  "language": "es",
  "status": "ONGOING",
  "description": "Una historia intensa...",
  "categories": ["Romance","Fantasia"],
  "tags": ["alfa","celos","triángulo","prohibido"],
  "coverFile": "cover.jpg"
}
```

### Zod Schema (validação)
```ts
import { z } from "zod";
export const StoryImportSchema = z.object({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  author: z.object({ penName: z.string().min(2) }),
  language: z.enum(["es","pt","en"]),
  status: z.enum(["ONGOING","COMPLETED","HIATUS"]),
  description: z.string().min(10),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  coverFile: z.string().optional(),
});
```

### Idempotência
- Gere **checksum** (ex.: SHA1 do ZIP). Armazene em tabela `imports` (id, checksum, createdAt, storyId).  
- **Se checksum repetir**, não reprocessar (retornar o resultado anterior).

### Tamanhos grandes (100–300 capítulos)
- `createMany` em **lotes de 100** (chunking) para não estourar payload/tempo
- Transação: crie `Story` + batch de `Chapters`; em erro → rollback

### Rotas
- `POST /api/admin/import` → multipart/ZIP  
- `POST /api/admin/stories` | `POST /api/admin/chapters` → CRUD

---

## 5) “Hot” e “Recomendados”

### Hot Score (job periódico)
Fórmula inicial (ajuste por telemetria):
```
hotScore = log10(reads_7d + 3*likes + 0.5*ratingCount + 1) 
           + time_decay(publishedAt)
```
- Calcule `reads_7d` a partir de `StoryDailyReads` (agregue leitura quando capítulo abre)
- **Cron**: 1×/dia — pg_cron ou Vercel Cron

**SQL Exemplo (ilustrativo):**
```sql
update "Story" s set "hotScore" = sub.score
from (
  select sd."storyId",
         log(10, coalesce(sum(sd.total) filter (where sd.date >= now() - interval '7 days'),0) + 1) +
         0.001 * extract(epoch from (now() - coalesce(s."publishedAt", now()))) * -1 as score
  from "Story" s
  left join "StoryDailyReads" sd on sd."storyId" = s.id
  group by sd."storyId", s."publishedAt"
) sub
where s.id = sub."storyId";
```

### Recomendados (MVP)
- Similaridade por **tags/categorias** (Jaccard): recompute 1×/dia
- Cache: `recommendations_cache(story_id, related jsonb, computed_at)`

---

## 6) SEO & PWA

### SEO
- **Sitemaps dinâmicos** (obras e capítulos)
- **schema.org**: `Book` (obra) e `Chapter` (capítulo)
- **OG dinâmico**: rota `/api/og?title=...` com imagem contendo capa + título
- Canonical + metas por idioma (`es`)

### PWA
- Manifest já criado; agora adicione Service Worker básico:
  - Cache de **/leer/[slug]/[num]** (capítulo atual e próximo)
  - Estratégia **Stale-While-Revalidate** para conteúdo do capítulo
  - Prompt “Adicionar à tela inicial”

> Priorize PWA para leitura resiliente em redes móveis.

---

## 8) Segurança, Admin Auth e RLS

### Fase 1 (rápida)
- Rotas admin protegidas via **header secreto**
- Zod em todas as entradas

### Fase 2 (correta)
- **Ativar RLS** nas tabelas e policies:
  - SELECT: público (anon) pode ler
  - INSERT/UPDATE/DELETE: apenas `role = 'admin'`
- Supabase Auth (magic link) para admins
- Guard nas rotas admin valida `jwt.role === 'admin'`

**Exemplo de Policy (conceito)**
```sql
alter table "Story" enable row level security;
create policy p_select_story on "Story" for select using (true);
create policy p_write_story on "Story" for all to authenticated using (auth.jwt() ->> 'role' = 'admin');
```

> Ajuste às convenções do Supabase para JWT e claims personalizadas.

---

## 9) Performance & Caching

- **next/image** com loader do Supabase (ou domínio permitido) para covers
- **Route Segment Caching** para páginas públicas (obra, home-seções)
- **ISR** (`revalidate`) em páginas de listagem
- **Cache-Control** em `/api/*` (ex.: `s-maxage=60, stale-while-revalidate=300`)
- Prefetch do **próximo capítulo** e de **recomendações** na página da obra

---

## 10) Qualidade: Lint, Tests, CI/CD

- **ESLint + Prettier** (regras sensatas para Next/TS)
- **Vitest** para unit tests (utils, hooks)  
- **Testing Library** para componentes  
- **Playwright** para E2E (fluxos: abrir obra, ler capítulo, buscar, importar ZIP)
- **GitHub Actions**:
  - CI: lint + build + tests
  - Preview Deploy (Vercel)
- **Ambientes**: `.env` para dev/preview/prod (Vercel Environment Variables)

---

## Planos de Tabela e Migrações Adicionais

### Engajamento (fase futura)
```prisma
model Rating {
  userId   String
  storyId  String
  stars    Int @db.SmallInt
  createdAt DateTime @default(now())
  @@id([userId, storyId])
}

model Like {
  userId   String
  storyId  String
  createdAt DateTime @default(now())
  @@id([userId, storyId])
}

model Bookmark {
  userId    String
  storyId   String
  chapterId String?
  progressPercent Int @default(0)
  updatedAt DateTime @updatedAt
  @@id([userId, storyId])
}
```

### Importador (controle)
```prisma
model ImportJob {
  id        String  @id @default(cuid())
  checksum  String  @unique
  storyId   String?
  status    String  // PENDING|DONE|ERROR
  message   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Exemplos de UI — Tokens e Estilo

### Tokens Tailwind
```css
:root {
  --color-primary: #CE7F78;
  --color-sepia: #EAE3D9;
}
```

### Botão Primário (shadcn/ui variante)
```tsx
import { cn } from "tailwind-merge";
export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn("inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]", props.className)}
    />
  );
}
```

### Card de Story (resumo)
- Capa `3/4`, título 2 linhas, status, lecturas — elegante e limpo

---

## Checklists Operacionais (para abrir PRs rapidamente)

### Leitor
- [ ] Fundo sépia e tipografia confortável
- [ ] Controles (font size, line-height, font family)
- [ ] Prefetch do próximo capítulo
- [ ] Progresso e eventos de analytics

### Home
- [ ] Seções dinâmicas (Hot, Más leídos, Completos)
- [ ] Carrosséis mobile com scroll-x
- [ ] Chips de categorias (link para páginas)

### Busca
- [ ] Endpoint FTS + ordenação por rank
- [ ] UI com debounce e grid de resultados
- [ ] Empty state

### Admin & Import
- [ ] CRUD básico
- [ ] Import ZIP com validação Zod
- [ ] Idempotência (checksum)
- [ ] Lotes com `createMany` (chunk 100)

### Infra
- [ ] OG dinâmico
- [ ] Sitemap dinâmico
- [ ] SW com cache offline de capítulo

### Segurança
- [ ] Guard nas rotas admin
- [ ] (Fase 2) RLS + policies + Auth Admin

### Qualidade
- [ ] ESLint/Prettier
- [ ] Vitest & Playwright
- [ ] CI (lint/build/tests) + Preview (Vercel)

---

## Roadmap Posterior (além deste ciclo)

- **Recomendações personalizadas** por histórico de leitura
- **Modo escuro** e tema ajustável
- **Comentários** (com moderação)
- **Importação EPUB**
- **Suporte a múltiplos idiomas de conteúdo** (pt/en) e UI i18n completa
- **Ads/Monetização** (se aplicável) e paywall por capítulo (futuro)

---

### Conclusão

Este guia transforma o Secret Historys de um setup funcional para um **MVP refinado e pronto para teste real**. Aplique as seções em PRs curtas e revisáveis. Se desejar, posso gerar scaffolds de código para cada item (Leitor, Seções da Home, Busca, Importador) para colar diretamente no projeto.
