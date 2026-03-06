# Task: Integrar botões do relatório na navegação principal

## Problema

Os botões de ação na página de relatório (Voltar, Contrato, Excel, PDF) estão em uma ilha separada no canto superior esquerdo. Em dispositivos móveis, essa ilha sobrepõe os botões de navegação no canto superior direito, prejudicando a usabilidade.

## Objetivo

Integrar os botões específicos do relatório à ilha de navegação principal (`SimpleNav`) quando o usuário estiver visualizando um relatório. Isso centralizará todas as ações em um único local e resolverá o problema de sobreposição em telas menores.

## Plano de Implementação

### 1. Comunicação via Eventos

Para manter a lógica de exportação e impressão no `ReportClient` sem acoplamento direto com a navegação global, usaremos `CustomEvents`.

- `report-action:print`
- `report-action:excel`
- `report-action:toggle-contract`

### 2. Modificações no `SimpleNav.tsx`

- Detectar se a página atual é um relatório (`pathname.startsWith('/report/')`).
- Se for, extrair o `estimateId` da URL.
- Adicionar os botões de ação do relatório no início da ilha de botões.
- Gerenciar o estado local do toggle do contrato (sincronizado via eventos ou localStorage se necessário).
- Adaptar o layout para mobile (ex: reduzir espaçamentos ou esconder ícones menos importantes quando muitos estiverem presentes).

### 3. Modificações no `ReportClient.tsx`

- Remover a `div` da ilha flutuante (`Floating Action Island`).
- Adicionar listeners para os eventos `report-action:*`.
- Manter o estado do contrato e as funções de exportação.

### 4. Refinamento de UI/UX (Mobile-First)

- Garantir que a ilha de botões não quebre em múltiplas linhas de forma deselegante.
- Usar dicas visuais (tooltips/sr-only labels).

## Verificação

- Testar navegação em desktop e mobile.
- Verificar se o toggle de contrato funciona.
- Verificar se as exportações (Excel/PDF) continuam funcionando.
- Verificar se o botão de "Voltar" redireciona corretamente para o editor.
