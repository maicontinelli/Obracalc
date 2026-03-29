/**
 * ObraPlana — Exportação de Orçamento para XLSX
 * Usa a biblioteca xlsx (SheetJS) já disponível no browser
 *
 * Instalar: npm install xlsx
 */

export interface ItemOrcamento {
  codigo?: string
  descricao: string
  unidade: string
  quantidade: number
  precoUnitario: number
  precoTotal: number
  etapa?: string
  memoriaCalculo?: string
}

export interface DadosOrcamento {
  titulo: string
  clienteNome?: string
  tipoObra?: string
  dataReferencia?: string
  bdi: number
  itens: ItemOrcamento[]
  totalSemBdi: number
  totalComBdi: number
  cidade?: string
  estado?: string
  responsavel?: string
  crea?: string
}

export async function exportarOrcamentoXLSX(dados: DadosOrcamento): Promise<void> {
  // Importação dinâmica para não impactar o bundle inicial
  const XLSX = await import('xlsx')

  const wb = XLSX.utils.book_new()

  // ── Aba 1: ORÇAMENTO ────────────────────────────────────────────
  const linhasOrcamento: (string | number)[][] = []

  // Cabeçalho
  linhasOrcamento.push(['ORÇAMENTO DE OBRAS'])
  linhasOrcamento.push([''])
  linhasOrcamento.push(['Obra:', dados.titulo])
  if (dados.clienteNome) linhasOrcamento.push(['Cliente:', dados.clienteNome])
  if (dados.tipoObra)    linhasOrcamento.push(['Tipo:', dados.tipoObra])
  if (dados.cidade)      linhasOrcamento.push(['Local:', `${dados.cidade}/${dados.estado ?? ''}`])
  if (dados.dataReferencia) linhasOrcamento.push(['Data base:', dados.dataReferencia])
  if (dados.responsavel) linhasOrcamento.push(['Responsável:', dados.responsavel])
  if (dados.crea)        linhasOrcamento.push(['CREA:', dados.crea])
  linhasOrcamento.push(['BDI:', `${dados.bdi.toFixed(2)}%`])
  linhasOrcamento.push([''])

  // Header da tabela
  linhasOrcamento.push([
    'Etapa',
    'Código',
    'Descrição',
    'Unid.',
    'Qtd.',
    'Preço Unit. (R$)',
    'Preço Total (R$)',
    'Memória de Cálculo',
  ])

  // Agrupar por etapa
  const etapas = new Map<string, ItemOrcamento[]>()
  for (const item of dados.itens) {
    const etapa = item.etapa ?? 'Sem etapa'
    if (!etapas.has(etapa)) etapas.set(etapa, [])
    etapas.get(etapa)!.push(item)
  }

  for (const [etapa, itens] of etapas) {
    // Linha de etapa
    linhasOrcamento.push([etapa, '', '', '', '', '', '', ''])

    let subtotal = 0
    for (const item of itens) {
      linhasOrcamento.push([
        '',
        item.codigo ?? '',
        item.descricao,
        item.unidade,
        item.quantidade,
        item.precoUnitario,
        item.precoTotal,
        item.memoriaCalculo ?? '',
      ])
      subtotal += item.precoTotal
    }

    // Subtotal da etapa
    linhasOrcamento.push(['', '', `Subtotal ${etapa}`, '', '', '', subtotal, ''])
    linhasOrcamento.push([''])
  }

  // Totais
  linhasOrcamento.push([''])
  linhasOrcamento.push(['', '', 'TOTAL SEM BDI', '', '', '', dados.totalSemBdi, ''])
  linhasOrcamento.push(['', '', `BDI (${dados.bdi.toFixed(2)}%)`, '', '', '', dados.totalSemBdi * (dados.bdi / 100), ''])
  linhasOrcamento.push(['', '', 'TOTAL COM BDI', '', '', '', dados.totalComBdi, ''])

  const wsOrcamento = XLSX.utils.aoa_to_sheet(linhasOrcamento)

  // Larguras das colunas
  wsOrcamento['!cols'] = [
    { wch: 20 },  // Etapa
    { wch: 12 },  // Código
    { wch: 45 },  // Descrição
    { wch: 8 },   // Unidade
    { wch: 10 },  // Qtd
    { wch: 16 },  // Preço Unit
    { wch: 16 },  // Preço Total
    { wch: 35 },  // Memória
  ]

  XLSX.utils.book_append_sheet(wb, wsOrcamento, 'Orçamento')

  // ── Aba 2: CURVA ABC ────────────────────────────────────────────
  const itensSorted = [...dados.itens].sort((a, b) => b.precoTotal - a.precoTotal)
  const linhasABC: (string | number)[][] = []
  linhasABC.push(['CURVA ABC — ANÁLISE DE CUSTOS'])
  linhasABC.push([''])
  linhasABC.push(['Rank', 'Descrição', 'Unid.', 'Qtd.', 'Preço Unit.', 'Preço Total', '% do Total', '% Acumulado', 'Classe'])

  let acumulado = 0
  itensSorted.forEach((item, i) => {
    const pct = (item.precoTotal / dados.totalSemBdi) * 100
    acumulado += pct
    const classe = acumulado <= 80 ? 'A' : acumulado <= 95 ? 'B' : 'C'
    linhasABC.push([
      i + 1,
      item.descricao,
      item.unidade,
      item.quantidade,
      item.precoUnitario,
      item.precoTotal,
      pct / 100,    // formato percentual no Excel
      acumulado / 100,
      classe,
    ])
  })

  const wsABC = XLSX.utils.aoa_to_sheet(linhasABC)
  wsABC['!cols'] = [
    { wch: 6 }, { wch: 45 }, { wch: 8 }, { wch: 10 },
    { wch: 16 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 8 },
  ]
  XLSX.utils.book_append_sheet(wb, wsABC, 'Curva ABC')

  // ── Aba 3: RESUMO POR ETAPA ─────────────────────────────────────
  const linhasResumo: (string | number)[][] = []
  linhasResumo.push(['RESUMO POR ETAPA'])
  linhasResumo.push([''])
  linhasResumo.push(['Etapa', 'Total (R$)', '% do Total'])

  for (const [etapa, itens] of etapas) {
    const total = itens.reduce((s, i) => s + i.precoTotal, 0)
    linhasResumo.push([etapa, total, total / dados.totalSemBdi])
  }

  linhasResumo.push([''])
  linhasResumo.push(['TOTAL', dados.totalSemBdi, 1])
  linhasResumo.push([`Total com BDI (${dados.bdi.toFixed(2)}%)`, dados.totalComBdi, ''])

  const wsResumo = XLSX.utils.aoa_to_sheet(linhasResumo)
  wsResumo['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo')

  // ── Download ────────────────────────────────────────────────────
  const nomeArquivo = `orcamento_${dados.titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_obraplana.xlsx`
  XLSX.writeFile(wb, nomeArquivo)
}
