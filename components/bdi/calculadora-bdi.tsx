'use client'

import { useState, useCallback } from 'react'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'

export interface ComponentesBDI {
  ac: number       // Administração Central (%)
  df: number       // Despesas Financeiras (%)
  risco: number    // Risco (%)
  seguros: number  // Seguros e Garantias (%)
  lucro: number    // Lucro (%)
  iss: number      // ISS (%)
  pisCofins: number // PIS + COFINS (%)
  csll: number     // CSLL (%)
}

export interface ResultadoBDI {
  bdi: number
  formula: string
}

// Fórmula do TCU: BDI = [(1+AC+DF+R+S+G)(1+L)/(1-T) - 1] × 100
// Simplificado com componentes padrão
export function calcularBDI(c: ComponentesBDI): ResultadoBDI {
  const AC = c.ac / 100
  const DF = c.df / 100
  const R = c.risco / 100
  const S = c.seguros / 100
  const L = c.lucro / 100
  const T = (c.iss + c.pisCofins + c.csll) / 100

  const numerador = (1 + AC + DF + R + S) * (1 + L)
  const denominador = 1 - T
  const bdi = (numerador / denominador - 1) * 100

  const formula = `BDI = [(1 + ${c.ac}% + ${c.df}% + ${c.risco}% + ${c.seguros}%) × (1 + ${c.lucro}%) / (1 - ${c.iss + c.pisCofins + c.csll}%)] - 1`

  return { bdi: Math.round(bdi * 100) / 100, formula }
}

const PRESETS: Record<string, { label: string; valores: ComponentesBDI }> = {
  'obra-publica': {
    label: 'Obra Pública (TCU)',
    valores: { ac: 4.00, df: 1.20, risco: 0.97, seguros: 0.80, lucro: 7.30, iss: 3.00, pisCofins: 3.65, csll: 1.08 },
  },
  'obra-privada-pequena': {
    label: 'Obra Privada Pequena',
    valores: { ac: 5.00, df: 1.50, risco: 1.50, seguros: 1.00, lucro: 10.00, iss: 3.00, pisCofins: 3.65, csll: 1.08 },
  },
  'reforma': {
    label: 'Reforma / Retrofit',
    valores: { ac: 6.00, df: 2.00, risco: 2.00, seguros: 1.00, lucro: 12.00, iss: 3.00, pisCofins: 3.65, csll: 1.08 },
  },
  'instalacoes': {
    label: 'Instalações Prediais',
    valores: { ac: 4.50, df: 1.50, risco: 1.20, seguros: 0.80, lucro: 9.00, iss: 3.00, pisCofins: 3.65, csll: 1.08 },
  },
}

interface Props {
  valorInicial?: ComponentesBDI
  onChange?: (componentes: ComponentesBDI, bdi: number) => void
  readOnly?: boolean
}

export function CalculadoraBDI({ valorInicial, onChange, readOnly = false }: Props) {
  const [componentes, setComponentes] = useState<ComponentesBDI>(
    valorInicial ?? PRESETS['obra-publica'].valores
  )
  const [aberto, setAberto] = useState(false)

  const resultado = calcularBDI(componentes)

  const atualizar = useCallback((campo: keyof ComponentesBDI, valor: number) => {
    const novo = { ...componentes, [campo]: valor }
    setComponentes(novo)
    onChange?.(novo, calcularBDI(novo).bdi)
  }, [componentes, onChange])

  const aplicarPreset = (key: string) => {
    const preset = PRESETS[key]
    if (preset) {
      setComponentes(preset.valores)
      onChange?.(preset.valores, calcularBDI(preset.valores).bdi)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header clicável */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">BDI — Benefícios e Despesas Indiretas</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fórmula TCU · Clique para detalhar componentes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{resultado.bdi.toFixed(2)}%</p>
          </div>
          {aberto ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {aberto && (
        <div className="px-4 pb-4 border-t border-border pt-4">
          {/* Presets */}
          {!readOnly && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Modelos predefinidos</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => aplicarPreset(key)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grupos de componentes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grupo 1: Custos Indiretos */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Custos Indiretos
              </p>
              <div className="space-y-2">
                <CampoPercentual
                  label="Administração Central (AC)"
                  tooltip="Custos da sede da empresa: aluguel, salários administrativos, etc."
                  value={componentes.ac}
                  onChange={v => atualizar('ac', v)}
                  readOnly={readOnly}
                />
                <CampoPercentual
                  label="Despesas Financeiras (DF)"
                  tooltip="Custo do capital necessário para financiar a obra antes dos recebimentos."
                  value={componentes.df}
                  onChange={v => atualizar('df', v)}
                  readOnly={readOnly}
                />
                <CampoPercentual
                  label="Risco (R)"
                  tooltip="Contingências por imprevistos, variações de mercado e eventos não previstos."
                  value={componentes.risco}
                  onChange={v => atualizar('risco', v)}
                  readOnly={readOnly}
                />
                <CampoPercentual
                  label="Seguros e Garantias (S)"
                  tooltip="Seguro de obra, garantia de execução e responsabilidade civil."
                  value={componentes.seguros}
                  onChange={v => atualizar('seguros', v)}
                  readOnly={readOnly}
                />
              </div>
            </div>

            {/* Grupo 2: Lucro e Tributos */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Lucro e Tributos
              </p>
              <div className="space-y-2">
                <CampoPercentual
                  label="Lucro (L)"
                  tooltip="Remuneração do empresário pelo risco do negócio."
                  value={componentes.lucro}
                  onChange={v => atualizar('lucro', v)}
                  readOnly={readOnly}
                  destaque
                />
                <CampoPercentual
                  label="ISS"
                  tooltip="Imposto Sobre Serviços — varia por município (2% a 5%)."
                  value={componentes.iss}
                  onChange={v => atualizar('iss', v)}
                  readOnly={readOnly}
                />
                <CampoPercentual
                  label="PIS + COFINS"
                  tooltip="3,65% para Simples / Lucro Presumido. 9,25% para Lucro Real."
                  value={componentes.pisCofins}
                  onChange={v => atualizar('pisCofins', v)}
                  readOnly={readOnly}
                />
                <CampoPercentual
                  label="CSLL"
                  tooltip="Contribuição Social sobre o Lucro Líquido."
                  value={componentes.csll}
                  onChange={v => atualizar('csll', v)}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Fórmula */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-mono break-all">{resultado.formula}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Fórmula conforme Acórdão TCU 2.622/2013
            </p>
          </div>

          {/* Resultado final */}
          <div className="mt-3 flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-foreground">BDI Calculado</span>
            <span className="text-xl font-bold text-primary">{resultado.bdi.toFixed(2)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface CampoProps {
  label: string
  tooltip: string
  value: number
  onChange: (v: number) => void
  readOnly?: boolean
  destaque?: boolean
}

function CampoPercentual({ label, tooltip, value, onChange, readOnly, destaque }: CampoProps) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <span className={`text-xs truncate ${destaque ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
          {label}
        </span>
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            className="text-muted-foreground/50 hover:text-muted-foreground"
          >
            <Info className="w-3 h-3" />
          </button>
          {showTip && (
            <div className="absolute left-4 bottom-0 z-50 w-48 p-2 bg-popover border border-border rounded shadow-lg text-xs text-muted-foreground">
              {tooltip}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {readOnly ? (
          <span className="text-sm font-medium w-16 text-right">{value.toFixed(2)}%</span>
        ) : (
          <>
            <input
              type="number"
              value={value}
              onChange={e => onChange(Math.max(0, Math.min(50, Number(e.target.value))))}
              step="0.01"
              min="0"
              max="50"
              className="w-16 text-right text-sm border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </>
        )}
      </div>
    </div>
  )
}
