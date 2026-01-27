# 🔄 PLANO DE MIGRAÇÃO - ObraPlana SIMPLE

## ✅ FASE 1: SETUP (COMPLETO)

- [x] Criar pasta ObraPlana-simple
- [x] Copiar configs (package.json, tsconfig, tailwind, etc)
- [x] Instalar dependências
- [x] Criar estrutura de pastas

## 🔄 FASE 2: COPIAR ARQUIVOS ESSENCIAIS (EM ANDAMENTO)

### Lib (utilitários puros - sem auth)

- [ ] `lib/constants.ts` - Templates de obra (BOQ_TEMPLATES)
- [ ] `lib/types.ts` - Types TypeScript
- [ ] `lib/utils.ts` - Funções utilitárias
- [ ] `lib/ddd-regions.ts` - Regiões por DDD

### Components (simplificados - sem auth)

- [ ] `components/BoqEditor.tsx` **[LIMPAR]** - Remover useAuth, Supabase, leads
- [ ] `components/CommandSearch.tsx` - Busca com IA (manter como está)
- [ ] `components/SimpleNav.tsx` **[NOVO]** - Navegação simples
- [ ] `components/Footer.tsx` - Rodapé

### Pages - App Directory

- [ ] `app/layout.tsx` **[LIMPAR]** - Remover AuthProvider
- [ ] `app/page.tsx` **[LIMPAR]** - Homepage sem botões de login
- [ ] `app/globals.css` - Estilos globais
- [ ] `app/editor/[id]/page.tsx` **[LIMPAR]** - Apenas BoqEditor limpo
- [ ] `app/report/[id]/page.tsx` **[LIMPAR]** - Apenas localStorage
- [ ] `app/planos/page.tsx` - Página de planos
- [ ] `app/sobre/page.tsx` - Sobre
- [ ] `app/contato/page.tsx` - Contato
- [ ] `app/apoie/page.tsx` - Apoie

### API Routes (IA - sem auth)

- [ ] `app/api/chat/route.ts` **[LIMPAR]** - Remover verificações de auth
- [ ] `app/api/search-services/route.ts` **[LIMPAR]** - Remover auth
- [ ] `app/api/suggest-item/route.ts` **[LIMPAR]** - Remover auth

### Public (assets)

- [ ] `public/*` - Copiar imagens/logos

## ❌ ARQUIVOS QUE NÃO VÃO SER COPIADOS

- AuthContext.tsx
- AuthProvider.tsx
- supabase.ts
- auth/*
- dashboard/*
- admin/*
- Dashboard*.tsx
- Admin*.tsx
- useAuth.tsx

## 🔧 FASE 3: LIMPEZA E AJUSTES

### BoqEditor.tsx

```typescript
// REMOVER:
- import { useAuth } from '@/contexts/AuthContext';
- import { supabase } from '@/lib/supabase';
- const { user } = useAuth();
- Todo código "if (user)" que salva no Supabase
- Funções de leads
- Contador mensal

// MANTER:
- localStorage
- IA search
- Add/remove items
- Export
```

### Report page

```typescript
// REMOVER:
- Carregamento do Supabase
- Funções de salvar

// MANTER:
- Carregamento do localStorage
- Exportação PDF/HTML
```

### Homepage

```typescript
// REMOVER:
- Botões de Login/Cadastro
- Links para Dashboard

// MANTER:
- IA search
- Botão "Novo Orçamento"
- Links para planos/sobre/contato
```

## 🧪 FASE 4: TESTE

- [ ] npm run dev
- [ ] Criar orçamento
- [ ] Usar IA
- [ ] Exportar PDF
- [ ] Verificar localStorage
- [ ] Build de produção

## 🚀 FASE 5: DEPLOY

- [ ] git init
- [ ] Criar repo no GitHub
- [ ] Deploy no Vercel
- [ ] Testar em produção

## 📊 PROGRESSO

- Fase 1: ✅ 100%
- Fase 2: 🔄 0%
- Fase 3: ⏳ Pendente
- Fase 4: ⏳ Pendente
- Fase 5: ⏳ Pendente

**PRÓXIMO PASSO**: Aguardar npm install terminar, depois copiar arquivos lib/
