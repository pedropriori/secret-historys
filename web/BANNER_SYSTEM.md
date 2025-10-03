# Sistema de Gerenciamento de Banners - Secret Historys

## Visão Geral

O sistema de banners permite controlar completamente o slider principal da página inicial, oferecendo total customização sobre imagens, textos, links e ordem de exibição dos banners.

## Funcionalidades Principais

### 1. **Gerenciamento Completo de Banners**
- ✅ Criar, editar e excluir banners
- ✅ Upload de imagens com validação
- ✅ Controle de ativação/desativação
- ✅ Ordenação personalizada
- ✅ Agendamento com datas de início e fim
- ✅ Links personalizados com texto customizado

### 2. **Interface Admin Intuitiva**
- ✅ Listagem visual com preview das imagens
- ✅ Modal de criação/edição responsivo
- ✅ Upload de arquivos com preview
- ✅ Validação em tempo real
- ✅ Feedback visual de sucesso/erro

### 3. **Slider Híbrido Inteligente**
- ✅ Prioriza banners quando disponíveis
- ✅ Fallback para stories em caso de ausência de banners
- ✅ Renderização otimizada para ambos os modos
- ✅ Suporte a links externos e internos

## Estrutura do Banco de Dados

### Modelo Banner
```prisma
model Banner {
  id          String   @id @default(cuid())
  title       String   // Título principal
  subtitle    String?  // Subtítulo opcional
  description String?  // Descrição detalhada
  imageUrl    String   // URL da imagem
  linkUrl     String?  // URL de destino
  linkText    String?  // Texto do botão
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  startDate   DateTime? // Data de início
  endDate     DateTime? // Data de fim
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isActive, order])
  @@index([startDate, endDate])
}
```

## APIs Implementadas

### 1. **Admin APIs** (Autenticação necessária)
- `GET /api/admin/banners` - Listar todos os banners
- `POST /api/admin/banners` - Criar novo banner
- `GET /api/admin/banners/[id]` - Buscar banner específico
- `PUT /api/admin/banners/[id]` - Atualizar banner
- `DELETE /api/admin/banners/[id]` - Excluir banner
- `POST /api/admin/banners/reorder` - Reordenar banners
- `POST /api/admin/banners/upload` - Upload de imagem

### 2. **API Pública**
- `GET /api/banners` - Buscar banners ativos (com filtros de data)

## Interface Admin

### Página Principal (`/admin/banners`)
- **Listagem Visual**: Cards com preview das imagens
- **Controles Rápidos**: Ativar/desativar, editar, excluir
- **Indicadores**: Status ativo/inativo, ordem de exibição
- **Ações em Lote**: Operações múltiplas (futuro)

### Modal de Criação/Edição
- **Campos Obrigatórios**: Título, imagem
- **Campos Opcionais**: Subtítulo, descrição, link, texto do botão
- **Upload de Imagem**: Drag & drop + URL manual
- **Validações**: Tipo de arquivo, tamanho máximo (5MB)
- **Agendamento**: Datas de início e fim
- **Preview**: Visualização em tempo real

## Validações e Segurança

### Upload de Imagens
- **Tipos Permitidos**: JPG, PNG, WebP
- **Tamanho Máximo**: 5MB
- **Nomenclatura**: UUID para evitar conflitos
- **Armazenamento**: `/public/uploads/banners/`

### Validações de Dados
- **Título**: Obrigatório, string não vazia
- **URLs**: Validação de formato quando fornecidas
- **Datas**: Validação de range (início ≤ fim)
- **Ordem**: Números inteiros positivos

## Lógica de Exibição

### Priorização
1. **Banners Ativos**: Se existirem banners ativos, eles são exibidos
2. **Stories Fallback**: Se não houver banners, usa stories em destaque
3. **Filtros Temporais**: Banners respeitam datas de início e fim

### Algoritmo de Seleção
```typescript
// 1. Buscar banners ativos no período atual
const activeBanners = banners.filter(banner => {
  const now = new Date();
  const isActive = banner.isActive;
  const inDateRange = (!banner.startDate || banner.startDate <= now) &&
                     (!banner.endDate || banner.endDate >= now);
  return isActive && inDateRange;
});

// 2. Ordenar por ordem definida
const sortedBanners = activeBanners.sort((a, b) => a.order - b.order);

// 3. Usar banners se disponíveis, senão stories
const sliderItems = sortedBanners.length > 0 ? sortedBanners : stories;
```

## Customização Visual

### Layout do Banner
- **Aspect Ratio**: 16:9 (desktop) / 21:9 (mobile)
- **Overlay**: Gradiente escuro para legibilidade
- **Tipografia**: Títulos grandes e impactantes
- **Botões**: Design consistente com o tema

### Responsividade
- **Mobile**: Layout otimizado para telas pequenas
- **Desktop**: Aproveitamento completo do espaço
- **Imagens**: Otimização automática com Next.js Image

## Próximas Melhorias

### Funcionalidades Planejadas
1. **Drag & Drop**: Reordenação visual dos banners
2. **Templates**: Modelos pré-definidos de layout
3. **Analytics**: Métricas de cliques e visualizações
4. **A/B Testing**: Testes de diferentes versões
5. **Bulk Operations**: Operações em lote
6. **Preview**: Visualização em tempo real das mudanças

### Otimizações Técnicas
1. **Cache**: Redis para melhor performance
2. **CDN**: Distribuição global das imagens
3. **Lazy Loading**: Carregamento sob demanda
4. **WebP**: Conversão automática de formatos

## Uso Prático

### Criando um Banner
1. Acesse `/admin/banners`
2. Clique em "Novo Banner"
3. Preencha título e faça upload da imagem
4. Configure link e texto do botão (opcional)
5. Defina ordem e datas (opcional)
6. Salve o banner

### Gerenciando Ordem
1. Na listagem, observe a coluna "Ordem"
2. Edite o banner desejado
3. Altere o número da ordem
4. Salve as alterações

### Agendamento
1. Defina data de início para banners futuros
2. Defina data de fim para banners temporários
3. Banners sem datas ficam sempre ativos

## Troubleshooting

### Problemas Comuns
1. **Imagem não carrega**: Verifique URL e permissões
2. **Banner não aparece**: Confirme se está ativo e no período
3. **Ordem incorreta**: Verifique números de ordem únicos
4. **Upload falha**: Verifique tipo e tamanho do arquivo

### Logs e Debug
- Verifique console do navegador para erros
- Confirme logs do servidor para problemas de API
- Valide dados no banco de dados se necessário

## Novas Funcionalidades (v2.0)

### 🎨 **Preview em Tempo Real**
- Preview instantâneo durante criação/edição
- Visualização exata de como ficará na página
- Atualização automática conforme campos são preenchidos
- Responsivo para diferentes tamanhos de tela

### 📐 **Instruções Detalhadas de Dimensões**
- Especificações técnicas claras (1920x1080px, 16:9)
- Validação de formatos e tamanhos
- Recomendações de qualidade e performance
- Links para ferramentas de edição

### ⚡ **Validações Avançadas**
- Verificação de tipo de arquivo
- Validação de tamanho (min: 100KB, max: 5MB)
- Feedback detalhado de erros
- Sugestões de correção automáticas

### 🛠️ **Ferramentas Integradas**
- Links diretos para Canva, TinyPNG, Remove.bg
- Guia completo de melhores práticas
- Dicas de design e performance
- Checklist de criação

### 📚 **Documentação Completa**
- Guia detalhado de uso (`BANNER_GUIDELINES.md`)
- Exemplos práticos de banners eficazes
- Troubleshooting de problemas comuns
- Estratégias de conteúdo e A/B testing

## Manutenção

### Limpeza Periódica
- Remover imagens não utilizadas
- Limpar banners expirados
- Otimizar imagens antigas

### Backup
- Fazer backup regular do banco de dados
- Manter backup das imagens importantes
- Documentar configurações críticas
