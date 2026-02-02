# Como Corrigir o Erro "column 'points' does not exist"

## Problema
O erro ocorre porque a tabela `profiles` no Supabase não possui a coluna `points`, que é necessária para o sistema de gamificação (triggers que recompensam usuários ao criar orçamentos).

## Solução

### Passo 1: Acessar o Supabase SQL Editor
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto ObraPlana
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Executar a Migração
1. Copie o conteúdo do arquivo `add_points_column.sql`
2. Cole no SQL Editor
3. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

### Passo 3: Verificar
Após executar, você pode verificar se a coluna foi criada com:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'points';
```

### Passo 4: Testar
Tente salvar um orçamento novamente. O erro não deve mais aparecer.

## O que essa migração faz?
- Adiciona a coluna `points` (tipo INTEGER, padrão 0) à tabela `profiles`
- Cria um índice para melhorar performance em consultas de pontos
- Garante permissões adequadas para usuários autenticados

## Nota Importante
Este erro começou a aparecer depois de adicionar o campo de área (m²) porque qualquer operação de INSERT/UPDATE na tabela `budgets` dispara os triggers de gamificação, que tentam atualizar a coluna `points` que não existia.
