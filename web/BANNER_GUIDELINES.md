# Guia Completo de Banners - Secret Historys

## 📐 Especificações Técnicas

### Dimensões Recomendadas
- **Tamanho ideal**: 1920 x 1080 pixels
- **Proporção**: 16:9 (widescreen)
- **Resolução**: 72 PPI (pixels por polegada)
- **Orientação**: Paisagem (horizontal)

### Formatos de Arquivo
- **JPG/JPEG**: Ideal para fotografias e imagens com muitas cores
- **PNG**: Melhor para imagens com transparência ou texto
- **WebP**: Formato otimizado (menor tamanho, mesma qualidade)

### Limites de Tamanho
- **Mínimo**: 100KB (para evitar imagens muito pequenas)
- **Máximo**: 5MB (para garantir carregamento rápido)
- **Recomendado**: 500KB - 2MB (equilíbrio entre qualidade e performance)

## 🎨 Diretrizes de Design

### Hierarquia Visual
1. **Título Principal** (maior destaque)
   - Máximo 60 caracteres
   - Fonte grande e bold
   - Cor branca com sombra para contraste

2. **Subtítulo** (destaque secundário)
   - Máximo 40 caracteres
   - Usado para categorias ou destaques
   - Aparece como badge colorido

3. **Descrição** (texto explicativo)
   - Máximo 150 caracteres
   - Texto menor e mais sutil
   - Máximo 2 linhas

4. **Botão de Ação**
   - Texto claro e específico
   - Exemplos: "Leia Agora", "Saiba Mais", "Descobrir"
   - Máximo 20 caracteres

### Paleta de Cores
- **Fundo**: Gradiente escuro (preto/cinza)
- **Texto**: Branco com sombra para legibilidade
- **Botão**: Gradiente roxo/rosa (#8B5CF6 → #EC4899)
- **Badges**: Branco semi-transparente com borda

### Contraste e Legibilidade
- **Contraste mínimo**: 4.5:1 (WCAG AA)
- **Sombra no texto**: `drop-shadow-2xl` para melhor legibilidade
- **Overlay escuro**: 50% de opacidade sobre a imagem
- **Gradiente de fundo**: Do transparente ao preto (90% opacidade)

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Adaptações por Tela
- **Mobile**: Texto menor, botões maiores para toque
- **Tablet**: Tamanho intermediário
- **Desktop**: Tamanho completo com máximo impacto

## ⚡ Performance

### Otimização de Imagens
1. **Comprimir antes do upload**
   - Use ferramentas como TinyPNG ou Compressor.io
   - Mantenha qualidade entre 80-90%

2. **Formatos otimizados**
   - WebP para navegadores modernos
   - JPG para compatibilidade universal
   - PNG apenas quando necessário (transparência)

3. **Tamanho de arquivo**
   - Objetivo: < 1MB por imagem
   - Máximo: 5MB (limite do sistema)

### Carregamento
- **Lazy loading**: Imagens carregam conforme necessário
- **Prioridade**: Primeira imagem carrega imediatamente
- **Fallback**: Gradiente colorido enquanto carrega

## 🔗 Links e Navegação

### Tipos de Link
1. **Interno**: `/obra/slug-da-historia`
2. **Externo**: `https://exemplo.com`
3. **Sem link**: Apenas visual (botão não clicável)

### Boas Práticas
- **URLs absolutas**: Sempre use `https://` para externos
- **Texto descritivo**: "Leia Agora" em vez de "Clique aqui"
- **Teste de links**: Verifique se funcionam antes de publicar

## 📅 Agendamento

### Datas de Início e Fim
- **Início**: Quando o banner deve aparecer
- **Fim**: Quando deve ser removido
- **Sem datas**: Banner sempre ativo

### Casos de Uso
- **Campanhas temporárias**: Black Friday, lançamentos
- **Promoções sazonais**: Natal, férias
- **Conteúdo evergreen**: Sempre ativo

## 🎯 Estratégias de Conteúdo

### Tipos de Banner
1. **Promocional**: Destaque de obras específicas
2. **Informativo**: Novidades, atualizações
3. **Sazonal**: Temas especiais, eventos
4. **Educativo**: Dicas de leitura, guias

### Elementos Eficazes
- **Imagens impactantes**: Cenas marcantes das histórias
- **Títulos chamativos**: Perguntas, promessas, curiosidades
- **Call-to-action claro**: Ação específica e urgente
- **Design limpo**: Foco no essencial

## 🛠️ Ferramentas Recomendadas

### Edição de Imagens
- **Canva**: Templates e redimensionamento
- **Photoshop**: Edição profissional
- **GIMP**: Alternativa gratuita
- **Figma**: Design colaborativo

### Compressão e Otimização
- **TinyPNG**: Compressão sem perda de qualidade
- **Squoosh**: Ferramenta do Google
- **ImageOptim**: Para Mac
- **RIOT**: Para Windows

### Remoção de Fundo
- **Remove.bg**: Automático e rápido
- **Canva**: Editor integrado
- **Photoshop**: Controle total
- **GIMP**: Gratuito e poderoso

## 📊 Métricas e Analytics

### KPIs Importantes
- **Taxa de clique**: % de usuários que clicam
- **Tempo de visualização**: Quanto tempo ficam no banner
- **Conversão**: % que leva à ação desejada
- **Engajamento**: Interações e compartilhamentos

### A/B Testing
- **Teste títulos**: Diferentes abordagens
- **Teste imagens**: Várias opções visuais
- **Teste CTAs**: Diferentes textos de botão
- **Teste horários**: Melhor momento para exibir

## 🚨 Problemas Comuns e Soluções

### Imagem não carrega
- **Causa**: URL inválida ou arquivo corrompido
- **Solução**: Verificar URL e re-fazer upload

### Texto ilegível
- **Causa**: Contraste insuficiente
- **Solução**: Ajustar overlay ou cor do texto

### Banner não aparece
- **Causa**: Banner inativo ou fora do período
- **Solução**: Verificar status e datas

### Performance lenta
- **Causa**: Imagem muito pesada
- **Solução**: Comprimir e otimizar

## 📋 Checklist de Criação

### Antes de Criar
- [ ] Definir objetivo do banner
- [ ] Escolher imagem de alta qualidade
- [ ] Preparar textos (título, subtítulo, descrição)
- [ ] Definir call-to-action
- [ ] Verificar se há link de destino

### Durante a Criação
- [ ] Upload da imagem otimizada
- [ ] Preenchimento de todos os campos
- [ ] Teste do preview
- [ ] Verificação da responsividade
- [ ] Teste do link (se aplicável)

### Após a Criação
- [ ] Verificar se está ativo
- [ ] Testar em diferentes dispositivos
- [ ] Monitorar performance
- [ ] Ajustar conforme necessário

## 🎨 Exemplos de Banners Eficazes

### Banner Promocional
```
Título: "Nova História em Destaque!"
Subtítulo: "Romance"
Descrição: "Uma história envolvente que vai te prender até o final"
Botão: "Começar Leitura"
```

### Banner Informativo
```
Título: "Atualizações Semanais"
Subtítulo: "Novidades"
Descrição: "Novos capítulos toda segunda-feira"
Botão: "Ver Cronograma"
```

### Banner Sazonal
```
Título: "Especial Halloween"
Subtítulo: "Terror"
Descrição: "Histórias de suspense para a noite mais assombrada"
Botão: "Explorar"
```

## 📞 Suporte

### Em caso de problemas
1. Verifique este guia primeiro
2. Teste em modo incógnito
3. Limpe o cache do navegador
4. Entre em contato com o suporte técnico

### Recursos Adicionais
- Documentação técnica completa
- Vídeos tutoriais
- Fórum da comunidade
- Suporte por email

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0
**Status**: Ativo
