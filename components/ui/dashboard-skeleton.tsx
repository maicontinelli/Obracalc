/**
 * ObraPlana — Dashboard Skeleton
 * Substitui o spinner genérico por um layout que espelha a estrutura real do dashboard.
 * Isso elimina o flash branco e melhora o LCP (Largest Contentful Paint).
 *
 * Uso: <DashboardSkeleton /> enquanto os dados carregam
 */

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header da página */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-muted rounded-lg" />
            <div className="h-4 w-32 bg-muted rounded mt-2" />
          </div>
          <div className="h-10 w-36 bg-primary/20 rounded-full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Cards de métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="h-3 w-20 bg-muted rounded mb-3" />
              <div className="h-8 w-28 bg-muted rounded mb-1" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>

        {/* Lista de orçamentos recentes */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <OrcamentoLineSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function OrcamentoLineSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Ícone */}
        <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {/* Título */}
          <div className="h-4 bg-muted rounded w-3/4 mb-1.5" />
          {/* Subtítulo */}
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Valor */}
        <div className="text-right hidden sm:block">
          <div className="h-4 w-24 bg-muted rounded mb-1" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
        {/* Status badge */}
        <div className="h-6 w-20 bg-muted rounded-full" />
        {/* Ações */}
        <div className="h-8 w-8 bg-muted rounded-lg" />
      </div>
    </div>
  )
}

// ── Skeleton do Editor de Orçamento ─────────────────────────────
export function EditorSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Barra superior do editor */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-muted rounded-lg" />
          <div className="h-5 w-48 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-muted rounded-lg" />
          <div className="h-9 w-24 bg-primary/20 rounded-lg" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Card de dados gerais */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="h-5 w-32 bg-muted rounded mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-3 w-20 bg-muted rounded mb-1.5" />
                <div className="h-10 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Card BDI */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-64 bg-muted rounded" />
            <div className="h-7 w-16 bg-primary/20 rounded" />
          </div>
        </div>

        {/* Tabela de itens */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-9 w-28 bg-primary/20 rounded-lg" />
          </div>
          <div className="divide-y divide-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="flex-1 h-4 bg-muted rounded" />
                <div className="w-12 h-4 bg-muted rounded" />
                <div className="w-16 h-4 bg-muted rounded" />
                <div className="w-20 h-4 bg-muted rounded" />
                <div className="w-20 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
