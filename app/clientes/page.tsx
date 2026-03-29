'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Building2, Phone, Mail, MapPin, FileText, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Cliente {
  id: string
  nome: string
  cpf_cnpj?: string
  email?: string
  telefone?: string
  cidade?: string
  estado?: string
  observacoes?: string
  created_at: string
  _total_orcamentos?: number
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)

  const supabase = createClient()

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    setCarregando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        orcamentos(count)
      `)
      .eq('user_id', user.id)
      .order('nome')

    if (!error && data) {
      setClientes(data.map(c => ({
        ...c,
        _total_orcamentos: (c.orcamentos as { count: number }[])?.[0]?.count ?? 0,
      })))
    }
    setCarregando(false)
  }

  async function excluirCliente(id: string) {
    if (!confirm('Excluir este cliente? Os orçamentos vinculados não serão excluídos.')) return
    await supabase.from('clientes').delete().eq('id', id)
    setClientes(prev => prev.filter(c => c.id !== id))
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf_cnpj?.includes(busca)
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {clientes.length} {clientes.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
            </p>
          </div>
          <button
            onClick={() => { setClienteEditando(null); setModalAberto(true) }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>

        {/* Busca */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Lista */}
        {carregando ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </p>
            {!busca && (
              <button
                onClick={() => { setClienteEditando(null); setModalAberto(true) }}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Cadastrar primeiro cliente
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {clientesFiltrados.map(cliente => (
              <div
                key={cliente.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{cliente.nome}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      {cliente.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {cliente.email}
                        </span>
                      )}
                      {cliente.telefone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {cliente.telefone}
                        </span>
                      )}
                      {(cliente.cidade || cliente.estado) && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {[cliente.cidade, cliente.estado].filter(Boolean).join('/')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {(cliente._total_orcamentos ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                      <FileText className="w-3 h-3" />
                      {cliente._total_orcamentos} orç.
                    </span>
                  )}
                  <button
                    onClick={() => { setClienteEditando(cliente); setModalAberto(true) }}
                    className="p-1.5 text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => excluirCliente(cliente.id)}
                    className="p-1.5 text-muted-foreground/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal novo/editar cliente */}
      {modalAberto && (
        <ModalCliente
          cliente={clienteEditando}
          onSalvar={async (dados) => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            if (clienteEditando) {
              const { data } = await supabase
                .from('clientes')
                .update(dados)
                .eq('id', clienteEditando.id)
                .select()
                .single()
              if (data) setClientes(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c))
            } else {
              const { data } = await supabase
                .from('clientes')
                .insert({ ...dados, user_id: user.id })
                .select()
                .single()
              if (data) setClientes(prev => [data, ...prev])
            }
            setModalAberto(false)
          }}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </div>
  )
}

// ── Modal de cliente ──────────────────────────────────────────────
interface ModalProps {
  cliente: Cliente | null
  onSalvar: (dados: Partial<Cliente>) => void
  onFechar: () => void
}

function ModalCliente({ cliente, onSalvar, onFechar }: ModalProps) {
  const [form, setForm] = useState({
    nome: cliente?.nome ?? '',
    cpf_cnpj: cliente?.cpf_cnpj ?? '',
    email: cliente?.email ?? '',
    telefone: cliente?.telefone ?? '',
    cidade: cliente?.cidade ?? '',
    estado: cliente?.estado ?? '',
    observacoes: cliente?.observacoes ?? '',
  })

  const f = (campo: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [campo]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold">{cliente ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button onClick={onFechar} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <Campo label="Nome *" value={form.nome} onChange={f('nome')} placeholder="Razão social ou nome completo" required />
          <Campo label="CPF / CNPJ" value={form.cpf_cnpj} onChange={f('cpf_cnpj')} placeholder="000.000.000-00" />
          <div className="grid grid-cols-2 gap-3">
            <Campo label="E-mail" value={form.email} onChange={f('email')} placeholder="cliente@email.com" type="email" />
            <Campo label="Telefone" value={form.telefone} onChange={f('telefone')} placeholder="(11) 99999-9999" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Campo label="Cidade" value={form.cidade} onChange={f('cidade')} placeholder="São Paulo" />
            </div>
            <Campo label="Estado" value={form.estado} onChange={f('estado')} placeholder="SP" maxLength={2} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={f('observacoes')}
              rows={2}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Informações adicionais sobre o cliente..."
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-border">
          <button
            onClick={onFechar}
            className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => form.nome && onSalvar(form)}
            disabled={!form.nome}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cliente ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Campo({ label, value, onChange, placeholder, type = 'text', required, maxLength }: {
  label: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string; type?: string; required?: boolean; maxLength?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>
  )
}
