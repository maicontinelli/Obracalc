# Sistema de Design & Padronização - ObraPlana

Este documento serve como guia flexível para manter a consistência visual e técnica do projeto, sem burocratizar a criatividade.

## 1. Princípios de Design (Core)
*   **Premium Minimalista:** Menos é mais, mas o que fica deve ter acabamento de alta qualidade (bordas sutis, sombras suaves, micro-interações).
*   **Dark Mode First:** O design deve brilhar no modo escuro. Use contrastes inteligentes (bordas `white/10`) para evitar que elementos "sumam" no fundo preto.
*   **Hierarquia via Layout:** Evite grids monótonos. Use layouts assimétricos ("Bento Grid") para destacar o que importa.
*   **Interatividade Sutil:** Elementos devem reagir ao cursor. Use `Spotlight`, `Hover` e `Scale` levemente.

## 2. Identidade Visual

### Cores Principais
*   **Brand Orange (Ação/Destaque):** `#E9813C` (Use para CTAs principais e acentos vitais).
*   **Tech Indigo (IA/Tech):** `#6366F1` (Use para features de IA e Relatórios).
*   **Success Green (Money):** `#22c55e` (Use para orçamentos e valores monetários).
*   **Backgrounds:**
    *   Light: `gray-50` / `white`.
    *   Dark: `neutral-900` / `#0A0A0A` (Evite preto absoluto `#000` chapado, prefira tons profundos).

### Tipografia
*   **Títulos (Headings):** `Manrope` (Font-weight: Bold/ExtraBold, Tracking: Tight).
    *   *Ex: "Fluxo completo inteligente"*
*   **Corpo (Body):** `Inter` (Legibilidade máxima).

### Formas & Efeitos
*   **Bordas (Radius):** `rounded-2xl` ou `rounded-3xl` para cards; `rounded-xl` para inputs/botões.
*   **Glassmorphism:** Use `bg-white/5` ou `bg-black/20` com `backdrop-blur-md` para criar profundidade.
*   **Ícones:** Nunca soltos. Sempre dentro de um container ("squaricle") com cor de fundo suave (`bg-primary/10`).

## 3. Componentes Padrão

### Cards (Ilhas)
Use sempre o componente `SpotlightCard` para áreas de conteúdo.
```tsx
<SpotlightCard className="border-neutral-200 dark:border-white/10" spotlightColor="...">
  {/* Conteúdo */}
</SpotlightCard>
```

### Botões
*   **Primário:** Fundo sólido (`bg-[#E9813C]`), texto branco, leve `hover:scale-105`.
*   **Secundário:** Outline (`border-2`), fundo semi-transparente (`bg-white/50`), blur.

### Inputs
*   Modo Dark: Fundo `bg-black/20`, Borda `border-white/10`.
*   Focus: Sempre deve ter `ring` ou cor de borda ativa (Ex: `focus:border-indigo-500`).

## 4. Segurança & Desenvolvimento
*   **Banco de Dados:** Toda nova tabela deve ter RLS (Row Level Security) ativado no Supabase.
*   **Uploads:** Validar tipo e tamanho de arquivo no cliente E no servidor (Storage Policies).
*   **Tailwind:** Evite CSS puro. Use classes utilitárias (`pt-4`, `flex`, etc.). Para classes condicionais, use `cn()`.
*   **Mobile First:** Todo componente novo deve ser testado em largura `md` (celular) antes de ser aprovado.

---
*Para dúvidas, consulte as páginas `/` (Landing) e `/relatorio-fotografico` como referências douradas.*
