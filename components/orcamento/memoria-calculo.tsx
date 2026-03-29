'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react'

interface Props {
  valor?: string
  onChange?: (valor: string) => void
  readOnly?: boolean
  placeholder?: string
}

export function MemoriaCalculo({
  valor = '',
  onChange,
  readOnly = false,
  placeholder = 'Ex: Calculado com base no projeto arquitetônico Rev.2, folha 07. Área = 45m² × espessura 14cm.',
}: Props) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(valor)
  const [rascunho, setRascunho] = useState(valor)

  const temConteudo = texto.trim().length > 0

  const salvar = () => {
    setTexto(rascunho)
    onChange?.(rascunho)
    setEditando(false)
  }

  const cancelar = () => {
    setRascunho(texto)
    setEditando(false)
  }

  if (readOnly && !temConteudo) return null

  return (
    <div className="mt-1">
      {!editando ? (
        <button
          type="button"
          onClick={() => !readOnly && setEditando(true)}
          className={`flex items-start gap-1.5 text-left w-full group ${
            readOnly ? 'cursor-default' : 'cursor-text'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${temConteudo ? 'text-primary/70' : 'text-muted-foreground/40'}`} />
          {temConteudo ? (
            <span className="text-xs text-muted-foreground line-clamp-2 flex-1">{texto}</span>
          ) : (
            <span className="text-xs text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
              + Adicionar memória de cálculo
            </span>
          )}
          {!readOnly && temConteudo && (
            <Pencil className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0 mt-0.5" />
          )}
        </button>
      ) : (
        <div className="border border-primary/30 rounded-lg bg-card shadow-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-border">
            <BookOpen className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-xs font-medium text-muted-foreground">Memória de Cálculo</span>
          </div>
          <textarea
            autoFocus
            value={rascunho}
            onChange={e => setRascunho(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-2.5 py-2 text-xs bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/40"
          />
          <div className="flex items-center justify-end gap-1 px-2 py-1.5 border-t border-border">
            <button
              type="button"
              onClick={cancelar}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
            >
              <X className="w-3 h-3" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              className="flex items-center gap-1 text-xs text-white bg-primary hover:bg-primary/90 px-2 py-1 rounded transition-colors"
            >
              <Check className="w-3 h-3" />
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Variante inline para tabelas compactas ───────────────────────
export function MemoriaCalculoCompacta({ valor = '', onChange, readOnly = false }: Props) {
  const [aberto, setAberto] = useState(false)
  const temConteudo = valor.trim().length > 0

  return (
    <div>
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className={`flex items-center gap-1 text-xs transition-colors ${
          temConteudo
            ? 'text-primary/70 hover:text-primary'
            : 'text-muted-foreground/30 hover:text-muted-foreground'
        }`}
        title="Memória de cálculo"
      >
        <BookOpen className="w-3 h-3" />
        {temConteudo && <span className="hidden sm:inline">Ver memória</span>}
        {aberto ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {aberto && (
        <MemoriaCalculo
          valor={valor}
          onChange={onChange}
          readOnly={readOnly}
        />
      )}
    </div>
  )
}
