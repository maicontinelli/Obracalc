'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export interface PassoOnboarding {
  id: string
  titulo: string
  descricao: string
  href?: string
  acaoBotao?: string
  concluido: boolean
}

const PASSOS_DEFAULT: PassoOnboarding[] = [
  {
    id: 'criar-orcamento',
    titulo: 'Crie seu primeiro orçamento',
    descricao: 'Clique em "Novo Orçamento" e deixe a IA sugerir os serviços para sua obra.',
    href: '/dashboard',
    acaoBotao: 'Criar orçamento',
    concluido: false,
  },
  {
    id: 'adicionar-cliente',
    titulo: 'Cadastre um cliente',
    descricao: 'Vincule um cliente ao orçamento para organizar seu histórico de propostas.',
    href: '/dashboard?tab=clientes',
    acaoBotao: 'Cadastrar cliente',
    concluido: false,
  },
  {
    id: 'configurar-bdi',
    titulo: 'Configure seu BDI',
    descricao: 'Defina os componentes do BDI da sua empresa: administração, lucro e tributos.',
    href: '/dashboard?tab=configuracoes',
    acaoBotao: 'Configurar BDI',
    concluido: false,
  },
  {
    id: 'exportar-pdf',
    titulo: 'Gere um relatório em PDF',
    descricao: 'Exporte seu orçamento em PDF profissional para enviar ao cliente.',
    concluido: false,
  },
  {
    id: 'plano-pro',
    titulo: 'Conheça o plano Pro',
    descricao: 'Acesse BDI avançado, SINAPI completo, contratos automáticos e muito mais.',
    href: '/planos',
    acaoBotao: 'Ver planos',
    concluido: false,
  },
]

interface Props {
  passos?: PassoOnboarding[]
  onPassoConcluido?: (id: string) => void
  onDismiss?: () => void
}

export function ChecklistPrimeirosPassos({ passos = PASSOS_DEFAULT, onPassoConcluido, onDismiss }: Props) {
  const [aberto, setAberto] = useState(true)
  const [dismissado, setDismissado] = useState(false)

  const concluidos = passos.filter(p => p.concluido).length
  const total = passos.length
  const progresso = Math.round((concluidos / total) * 100)
  const todosFeitos = concluidos === total

  const handleDismiss = () => {
    setDismissado(true)
    onDismiss?.()
  }

  if (dismissado || todosFeitos) return null

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Primeiros passos no ObraPlana
            </p>
            <div className="flex items-center gap-2 mt-1">
              {/* Progress bar */}
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {concluidos}/{total}
              </span>
            </div>
          </div>
          {aberto ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
          )}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Lista de passos */}
      {aberto && (
        <div className="border-t border-border divide-y divide-border">
          {passos.map((passo) => (
            <PassoItem
              key={passo.id}
              passo={passo}
              onConcluir={() => onPassoConcluido?.(passo.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PassoItem({ passo, onConcluir }: { passo: PassoOnboarding; onConcluir: () => void }) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className={`transition-colors ${passo.concluido ? 'opacity-60' : ''}`}>
      <button
        type="button"
        onClick={() => !passo.concluido && setExpandido(!expandido)}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        {passo.concluido ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${passo.concluido ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {passo.titulo}
          </p>
          {expandido && !passo.concluido && (
            <p className="text-xs text-muted-foreground mt-1">{passo.descricao}</p>
          )}
        </div>
        {!passo.concluido && (
          expandido ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" /> :
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        )}
      </button>

      {expandido && !passo.concluido && (
        <div className="px-10 pb-3 flex items-center gap-2">
          {passo.href ? (
            <Link
              href={passo.href}
              className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {passo.acaoBotao ?? 'Ir agora'}
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onConcluir}
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            Marcar como feito
          </button>
        </div>
      )}
    </div>
  )
}

// ── Hook para persistir estado do onboarding ─────────────────────
export function useOnboarding(userId: string) {
  const KEY = `obraplana_onboarding_${userId}`

  const [concluidos, setConcluidos] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [dismissado, setDismissado] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`${KEY}_dismissed`) === 'true'
  })

  const concluirPasso = (id: string) => {
    setConcluidos(prev => {
      const novo = new Set(prev)
      novo.add(id)
      localStorage.setItem(KEY, JSON.stringify([...novo]))
      return novo
    })
  }

  const dismiss = () => {
    setDismissado(true)
    localStorage.setItem(`${KEY}_dismissed`, 'true')
  }

  const passosComStatus = PASSOS_DEFAULT.map(p => ({
    ...p,
    concluido: concluidos.has(p.id),
  }))

  return { passosComStatus, concluirPasso, dismiss, dismissado }
}
