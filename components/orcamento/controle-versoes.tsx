'use client'

import { useState } from 'react'
import { GitBranch, Clock, ChevronDown, ChevronUp, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface VersaoOrcamento {
  id: string
  versao: number              // 0 = Rev.0, 1 = Rev.1, etc.
  tituloVersao?: string       // "Aprovação preliminar", "Revisão cliente", etc.
  valorTotal: number
  valorComBdi: number
  motivoRevisao?: string
  criadoEm: string            // ISO date
}

interface Props {
  versaoAtual: number
  versoes: VersaoOrcamento[]
  onRestaurar?: (versao: VersaoOrcamento) => void
  onNovaVersao?: (motivo: string) => void
}

export function ControleVersoes({ versaoAtual, versoes, onRestaurar, onNovaVersao }: Props) {
  const [aberto, setAberto] = useState(false)
  const [criandoVersao, setCriandoVersao] = useState(false)
  const [motivo, setMotivo] = useState('')

  const versoesSorted = [...versoes].sort((a, b) => b.versao - a.versao)
  const ultimaVersao = versoesSorted[1] // anterior à atual

  const handleNovaVersao = () => {
    if (motivo.trim()) {
      onNovaVersao?.(motivo.trim())
      setMotivo('')
      setCriandoVersao(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Versões do Orçamento</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
            Rev.{versaoAtual}
          </span>
          <span className="text-xs text-muted-foreground">
            {versoes.length} {versoes.length === 1 ? 'revisão' : 'revisões'}
          </span>
        </div>
        {aberto ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {aberto && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
          {/* Botão nova versão */}
          {onNovaVersao && (
            <div>
              {!criandoVersao ? (
                <button
                  type="button"
                  onClick={() => setCriandoVersao(true)}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  Salvar como Rev.{versaoAtual + 1}
                </button>
              ) : (
                <div className="border border-primary/30 rounded-lg p-3 bg-primary/5">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Motivo da revisão (opcional)
                  </p>
                  <input
                    type="text"
                    autoFocus
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNovaVersao()}
                    placeholder="Ex: Alteração de escopo pelo cliente"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleNovaVersao}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90"
                    >
                      Criar Rev.{versaoAtual + 1}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCriandoVersao(false); setMotivo('') }}
                      className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline de versões */}
          <div className="space-y-2">
            {versoesSorted.map((v, idx) => {
              const anterior = versoesSorted[idx + 1]
              const variacao = anterior
                ? ((v.valorComBdi - anterior.valorComBdi) / anterior.valorComBdi) * 100
                : null
              const isAtual = v.versao === versaoAtual

              return (
                <div
                  key={v.id}
                  className={`rounded-lg border p-3 ${
                    isAtual
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isAtual ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {v.versao}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-medium">Rev.{v.versao}</span>
                          {isAtual && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">atual</span>
                          )}
                          {v.tituloVersao && (
                            <span className="text-xs text-muted-foreground truncate">— {v.tituloVersao}</span>
                          )}
                        </div>
                        {v.motivoRevisao && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.motivoRevisao}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground/50" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(v.criadoEm).toLocaleDateString('pt-BR', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">
                        {v.valorComBdi.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      {variacao !== null && (
                        <div className={`flex items-center justify-end gap-0.5 text-xs ${
                          variacao > 0 ? 'text-red-500' : variacao < 0 ? 'text-green-500' : 'text-muted-foreground'
                        }`}>
                          {variacao > 0.01 ? <TrendingUp className="w-3 h-3" /> :
                           variacao < -0.01 ? <TrendingDown className="w-3 h-3" /> :
                           <Minus className="w-3 h-3" />}
                          {Math.abs(variacao).toFixed(1)}%
                          {variacao > 0.01 ? ' vs anterior' : variacao < -0.01 ? ' vs anterior' : ' sem variação'}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isAtual && onRestaurar && (
                    <button
                      type="button"
                      onClick={() => onRestaurar(v)}
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Restaurar esta versão
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
