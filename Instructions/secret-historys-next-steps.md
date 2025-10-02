# Secret Historys — Guia de Próximos Passos de Desenvolvimento

_Plataforma web (mobile-first) para leitura de histórias/novelas — seguindo referências visuais de Buenovela e Dreame_  

Este documento detalha as **próximas etapas de desenvolvimento** após o setup inicial já concluído (Next.js, Supabase, Prisma, FTS configurado). O foco agora é implementar as páginas principais (Leitor, Home, Busca) com design elegante e funcional, dentro da paleta definida:  

- **Primária (rosa)**: `#CE7F78`  
- **Fundo leitura (sépia/off-white)**: `#EAE3D9`  

---

## Sumário
1. [Página de Leitura de Capítulos (`/leer/[slug]/[num]`)](#página-de-leitura-de-capítulos-leerslugnum)  
2. [Página Inicial Real (Home)](#página-inicial-real-home)  
3. [Busca Global de Obras](#busca-global-de-obras)  
4. [Design & UI Elegante](#design--ui-elegante)  
5. [Importador de Obras (Planejamento)](#importador-de-obras-planejamento)  
6. [Checklist de Boas Práticas](#checklist-de-boas-práticas)  
7. [Próximos Passos Após Este Ciclo](#próximos-passos-após-este-ciclo)

---

## Página de Leitura de Capítulos (`/leer/[slug]/[num]`)

### Objetivo
Criar um **ambiente de leitura confortável**, inspirado em apps como Buenovela e Dreame, priorizando o mobile-first.  

### Requisitos
- Fundo **sépia** `#EAE3D9`  
- Fonte sem serifa, legível e confortável (ex: `Inter`, `Noto Serif`)  
- Layout fluido (margens laterais balanceadas)  
- Navegação simples: **Anterior / Próximo capítulo**  
- Exibição do progresso (ex: “Capítulo 2 de 40”)  

### Implementação
1. **Rota**: `src/app/leer/[slug]/[num]/page.tsx`  
2. **Consulta**: carregar capítulo via Prisma (`storyId + number`)  
3. **Renderização**:  
   - `react-markdown` para exibir `contentMd`  
   - `remark-gfm` para suportar Markdown extendido  
4. **UI**:  
   - Header minimalista com título da obra  
   - Corpo em background sépia  
   - Botões fixos (bottom) para navegar entre capítulos  

**Exemplo de UI (simplificado):**
```tsx
<div className="min-h-screen bg-sepia px-4 py-6">
  <article className="prose prose-neutral max-w-3xl mx-auto">
    <h1>{chapter.title}</h1>
    <Markdown>{chapter.contentMd}</Markdown>
  </article>
  <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t flex justify-between px-4 py-3">
    <a href={`/leer/${slug}/${prev}`} className="btn">Anterior</a>
    <a href={`/leer/${slug}/${next}`} className="btn">Siguiente</a>
  </div>
</div>
```

---

## Página Inicial Real (Home)

### Objetivo
Transformar a página inicial em um **hub de descoberta de histórias**.  

### Seções
1. **En tendencia** → ordenado por `hotScore`  
2. **Más leídos** → ordenado por `readsTotal`  
3. **Completos** → `status = COMPLETED`  
4. **Recomendados** → curadoria manual (campo futuro, opcional no MVP)  

### Design
- Cards horizontais (scroll lateral em mobile)  
- 3 a 6 itens por seção  
- Título da seção + botão “Ver más”  
- Layout **limpo, cores suaves, tipografia consistente**  

**Exemplo (scroll lateral):**
```tsx
<section className="space-y-2">
  <h2 className="text-lg font-semibold">En tendencia</h2>
  <div className="flex gap-4 overflow-x-auto pb-2">
    {stories.map(story => <StoryCard key={story.id} story={story} />)}
  </div>
</section>
```

---

## Busca Global de Obras

### Objetivo
Permitir que o usuário encontre obras rapidamente digitando palavras-chave.  

### Implementação
- **Endpoint**: `/api/search?q=...`  
- SQL usando FTS:  
```sql
select *
from "Story"
where "searchVector" @@ plainto_tsquery('spanish', unaccent($1))
order by ts_rank("searchVector", plainto_tsquery('spanish', unaccent($1))) desc
limit 20;
```
- UI:
  - Barra de busca no header  
  - Resultados exibidos em grid de `StoryCard`  

---

## Design & UI Elegante

### Inspirações
- Buenovela e Dreame: **minimalismo + foco na leitura**  
- Mobile-first, mas responsivo para desktop  
- Uso de **tons suaves** com rosa primário para destaques  

### Guidelines
- **Paleta principal**:  
  - Rosa primário: `#CE7F78`  
  - Sépia leitura: `#EAE3D9`  
  - Neutros: cinzas (`#333`, `#666`, `#999`)  
- **Tipografia**:  
  - UI: `Inter` ou `Poppins`  
  - Leitura: `Noto Serif` ou `Georgia`  
- **Componentes shadcn/ui**:  
  - Botões (`button`), Cards (`card`), Abas (`tabs`)  
  - Manter consistência com design tokens  

---

## Importador de Obras (Planejamento)

### Objetivo
Facilitar o upload de **obras completas** (ex: 200 capítulos).  

### Formato sugerido (ZIP):
```
obra-title.zip
 ├─ cover.jpg
 ├─ story.json     # metadados (titulo, autor, status, categorias, tags)
 └─ chapters/
      ├─ 001.md
      ├─ 002.md
      └─ ...
```

### Fluxo
1. Admin faz upload do ZIP  
2. Backend extrai arquivos, valida JSON, insere no banco via Prisma  
3. Capítulos salvos em batch (`createMany`)  
4. Capa salva no Supabase Storage  

> **Nota**: este recurso pode ser incluído após termos Leitor + Home + Busca funcionando.  

---

## Checklist de Boas Práticas

- [ ] Mobile-first em todas as páginas  
- [ ] Reuso de componentes shadcn/ui  
- [ ] Queries paginadas (evitar carregar 200 capítulos de uma vez)  
- [ ] Imagens servidas via Supabase Storage + `next/image`  
- [ ] Acessibilidade: contraste adequado, navegação por teclado  
- [ ] SEO: titles, meta descriptions, sitemap dinâmico  

---

## Próximos Passos Após Este Ciclo
1. **Finalizar Leitor** `/leer/[slug]/[num]`  
2. **Completar Home** com seções dinâmicas  
3. **Ativar Busca Global** usando FTS configurado  
4. **Iniciar Importador ZIP** (painel admin)  
5. **Refinar UI/UX** (melhorar navegação, animações suaves, dark mode futuro)  
6. **Deploy em Vercel** (com DB Supabase já conectado)  

---

> Com esse guia, a aplicação Secret Historys evolui do setup inicial para um MVP funcional e elegante, já pronto para testes de leitura, descoberta e navegação.  
