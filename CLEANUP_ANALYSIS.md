# Análise de Código Obsoleto - Sistema de Pontos e Marketplace

## 📊 Resumo da Análise

Data: 2026-02-01
Status: Sistema de pontos e marketplace REMOVIDO do projeto

---

## 🗑️ Arquivos SQL Obsoletos Identificados

### Sistema de Pontos/Gamificação

1. **add_points_column.sql** - Adiciona coluna points (OBSOLETO)
2. **setup_points_system.sql** - Configuração inicial de pontos (OBSOLETO)
3. **gamification_setup.sql** - Triggers de gamificação (OBSOLETO)
4. **simple_gamification.sql** - Sistema simplificado (OBSOLETO)

### Sistema de Marketplace

5. **fix_rls_marketplace.sql** - Políticas RLS para marketplace (OBSOLETO)
2. **add_unlock_count.sql** - Contador de desbloqueios (OBSOLETO)
3. **get_unlocked_rpc.sql** - RPC para buscar leads desbloqueados (OBSOLETO)
4. **increment_unlock_rpc.sql** - RPC para incrementar unlock_count (OBSOLETO)

---

## 🔍 Código TypeScript/React Obsoleto

### BoqEditor.tsx

**Linhas afetadas:**

- Linha 49: `const [visibility, setVisibility] = useState('private');` ❌
- Linha 115: `.select('content, updated_at, visibility')` ❌
- Linha 124: `setVisibility(data.visibility || 'private');` ❌
- Linha 448: `const currentVisibility = tier === 'free' ? 'marketplace' : visibility;` ❌
- Linha 468: `visibility: currentVisibility` ❌

**Ação:** Remover todo o sistema de visibility/marketplace

### useProfile.ts

**Linha afetada:**

- Linha 52: `points: 0` ❌

**Ação:** Remover inicialização de points

---

## ✅ Arquivos que DEVEM ser mantidos

### Estrutura de Banco de Dados

- `add_total_value.sql` ✅ - Total do orçamento
- `add_summary_column.sql` ✅ - Resumo de serviços
- `fix_profile_columns_full.sql` ✅ - Colunas de perfil
- `add_address_columns_to_profiles.sql` ✅ - Endereços
- `database_migration_v8_anonymous.sql` ✅ - Orçamentos anônimos

### Sistema de Assinaturas

- Arquivos relacionados a Stripe/AbacatePay ✅
- Sistema de tiers (free/pro/business) ✅

---

## 🎯 Plano de Limpeza

### Fase 1: Remover Arquivos SQL

```bash
rm add_points_column.sql
rm setup_points_system.sql
rm gamification_setup.sql
rm simple_gamification.sql
rm fix_rls_marketplace.sql
rm add_unlock_count.sql
rm get_unlocked_rpc.sql
rm increment_unlock_rpc.sql
rm FIX_POINTS_ERROR.md
```

### Fase 2: Limpar Código TypeScript

1. **BoqEditor.tsx**
   - Remover state `visibility`
   - Remover lógica de `currentVisibility`
   - Remover campo `visibility` do upsert do Supabase
   - Remover do SELECT ao carregar dados

2. **useProfile.ts**
   - Remover `points: 0` da inicialização

### Fase 3: Limpar Banco de Dados (Supabase)

Executar no SQL Editor:

```sql
-- Remover triggers de gamificação
DROP TRIGGER IF EXISTS budget_creation_reward ON public.budgets;
DROP TRIGGER IF EXISTS marketplace_indication_reward ON public.budgets;

-- Remover funções
DROP FUNCTION IF EXISTS public.handle_new_budget_points();
DROP FUNCTION IF EXISTS public.handle_marketplace_points();
DROP FUNCTION IF EXISTS public.update_points(UUID, INT);
DROP FUNCTION IF EXISTS get_unlocked_budgets(UUID[]);
DROP FUNCTION IF EXISTS increment_unlock_count(UUID);

-- Remover colunas obsoletas
ALTER TABLE public.profiles DROP COLUMN IF EXISTS points;
ALTER TABLE public.budgets DROP COLUMN IF EXISTS visibility;
ALTER TABLE public.budgets DROP COLUMN IF EXISTS unlock_count;

-- Remover índices
DROP INDEX IF EXISTS idx_profiles_points;
DROP INDEX IF EXISTS idx_budgets_visibility;
```

---

## 📝 Notas Importantes

1. **Por que o erro apareceu?**
   - Os triggers de gamificação ainda estavam ativos no Supabase
   - Ao salvar um orçamento, os triggers tentavam atualizar `points`
   - A coluna não existia → erro

2. **Impacto da remoção**
   - ✅ Código mais limpo e focado
   - ✅ Menos complexidade no banco de dados
   - ✅ Menos triggers = melhor performance
   - ✅ Menos manutenção futura

3. **Sistema de Assinaturas permanece intacto**
   - Tiers (free/pro/business) continuam funcionando
   - Limites de orçamentos por tier mantidos
   - Integração com pagamentos preservada
