# Sistema de Métricas - Secret Historys

## Visão Geral

O sistema de métricas permite gerar dados aleatórios realísticos para todas as obras cadastradas, simulando engajamento e popularidade para as seções "En Tendência" e "Más Leídos" da página inicial.

## Funcionalidades

### 1. Geração de Dados Aleatórios

- **Leituras (readsTotal)**: Entre 500K e 19.7M com distribuição realística
- **Notas (ratingAvg)**: Entre 4.2 e 5.0 com distribuição realística  
- **Likes (likesTotal)**: Calculados como 1-3% das leituras
- **Hot Score**: Calculado automaticamente baseado nas métricas
- **Manual Rating**: Usa a mesma nota do ratingAvg

### 2. Distribuições Realísticas

#### Leituras
- 70% das obras: 500K - 5M leituras
- 25% das obras: 5M - 15M leituras  
- 5% das obras: 15M - 19.7M leituras

#### Notas
- 60% das obras: 4.2 - 4.7 estrelas
- 30% das obras: 4.7 - 4.9 estrelas
- 10% das obras: 4.9 - 5.0 estrelas

### 3. Fórmula do Hot Score

```
Hot Score = (log10(leituras + 1) × 100) + (nota × 20) + (log10(likes + 1) × 50)
```

## Como Usar

### 1. Acesso à Interface Admin

1. Navegue para `/admin`
2. Clique em "Gerar Métricas" ou acesse `/admin/metrics`
3. Clique no botão "Gerar Métricas"

### 2. API Endpoint

```bash
POST /api/admin/generate-metrics
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Métricas atualizadas para X histórias",
  "stats": {
    "totalStories": 10,
    "avgReads": 2500000,
    "avgRating": 4.6,
    "avgLikes": 75000,
    "avgHotScore": 1250.5
  }
}
```

## Arquivos Criados/Modificados

### Novos Arquivos
- `src/app/api/admin/generate-metrics/route.ts` - API endpoint
- `src/app/admin/metrics/page.tsx` - Interface admin
- `scripts/test-metrics.ts` - Script de teste

### Arquivos Modificados
- `src/app/admin/layout.tsx` - Adicionado link para métricas
- `src/app/admin/page.tsx` - Adicionado card de métricas
- `src/components/shared/StoryCard.tsx` - Melhorias na exibição

## Melhorias Visuais

### StoryCard Atualizado
- Exibe nota (manualRating ou ratingAvg)
- Badge "Trending" para hotScore > 1000
- Formatação melhorada dos números
- Indicadores visuais de popularidade

### Interface Admin
- Avisos de segurança sobre sobrescrita de dados
- Estatísticas em tempo real após geração
- Explicação detalhada do funcionamento
- Feedback visual de sucesso/erro

## Testando o Sistema

### 1. Script de Teste
```bash
cd web
npx tsx scripts/test-metrics.ts
```

### 2. Teste Manual
1. Acesse `/admin/metrics`
2. Clique em "Gerar Métricas"
3. Verifique as estatísticas geradas
4. Visite a página inicial para ver os resultados

## Considerações Técnicas

### Performance
- Atualização em batch para todas as histórias
- Uso de Promise.all para operações paralelas
- Índices otimizados no banco de dados

### Segurança
- Validação de dados de entrada
- Tratamento de erros robusto
- Logs detalhados para debugging

### Escalabilidade
- Algoritmo eficiente para grandes volumes
- Distribuições realísticas para simular dados reais
- Fórmulas matemáticas otimizadas

## Próximos Passos

1. **Métricas de Leitura Real**: Implementar tracking quando usuários acessam capítulos
2. **Cache Redis**: Adicionar cache para melhor performance
3. **Dashboard Avançado**: Gráficos e análises detalhadas
4. **Configuração Flexível**: Permitir ajustar distribuições via admin
5. **Histórico de Métricas**: Salvar evolução ao longo do tempo

## Manutenção

### Limpeza de Dados
Para resetar todas as métricas:
```sql
UPDATE "Story" SET 
  "readsTotal" = 0,
  "ratingAvg" = 0,
  "ratingCount" = 0,
  "likesTotal" = 0,
  "hotScore" = 0,
  "manualRating" = NULL;
```

### Monitoramento
- Verificar logs da API para erros
- Monitorar performance das consultas
- Validar distribuições geradas periodicamente
