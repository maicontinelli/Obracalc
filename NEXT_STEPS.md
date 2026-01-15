# Próximos Passos - Sessão Marketplace

## Status Atual

- **Marketplace Backend:** ✅ Funcional (Compra, Venda, Comissão).
- **Limite de Vagas:** ✅ Implementado (Max 3 por lead).
- **Dashboard ("Meus Contatos"):** 🚧 Implementado mas não exibe os dados.

## Pendências para Resolver

1. **Painel "Meus Contatos Desbloqueados" não aparece:**
   - O componente `UnlockedLeads.tsx` está no Dashboard.
   - O SQL `fix_rls_transactions.sql` foi rodado.
   - O SQL `get_unlocked_rpc.sql` foi rodado.
   - **Sintoma:** O componente retorna nulo ou vazio.
   - **Ação:** Debugar retorno da RPC `get_unlocked_budgets` e verificar se a politica de transactions está permitindo o select inicial.

2. **Deploy Final:**
   - Após corrigir o painel, fazer o deploy para produção (Vercel) para ativar o limite de vagas e o novo painel para os usuários.
