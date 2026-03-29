/**
 * ObraPlana — Centralizador de Metadata SEO
 *
 * Uso em cada page.tsx:
 *   import { getMetadata } from '@/lib/seo-metadata'
 *   export const metadata = getMetadata('home')
 *
 * Para páginas dinâmicas (editor, report):
 *   export async function generateMetadata({ params }) {
 *     return getMetadataDinamica('editor', { titulo: 'Meu Orçamento' })
 *   }
 */

import type { Metadata } from 'next'

const BASE_URL = 'https://obraplana.app'
const NOME_APP = 'ObraPlana'
const DESCRICAO_BASE = 'Crie orçamentos de construção civil profissionais com IA. SINAPI integrado, BDI calculado, curva ABC e relatórios em PDF.'

// ── Keywords por contexto ────────────────────────────────────────
const KW = {
  home: 'orçamento construção civil, orçamento obra, SINAPI, BDI construção, orçamento inteligente, software orçamento obra',
  planos: 'planos ObraPlana, preço orçamento construção, software orçamento engenheiro',
  login: 'entrar ObraPlana, login sistema orçamento',
  dashboard: 'painel orçamentos, gestão orçamentos obras',
  editor: 'editor orçamento obra, criar orçamento construção, planilha orçamento SINAPI',
  report: 'relatório orçamento, PDF orçamento construção, proposta comercial obra',
  privacidade: 'política privacidade ObraPlana, LGPD',
  planos_profissional: 'plano profissional orçamento, software engenheiro civil',
}

// ── Metadata estática por rota ───────────────────────────────────
const PAGINAS: Record<string, Metadata> = {
  home: {
    title: `${NOME_APP} — Orçamentos de Obras com IA`,
    description: DESCRICAO_BASE,
    keywords: KW.home,
    openGraph: {
      title: `${NOME_APP} — Orçamentos de Obras com IA`,
      description: DESCRICAO_BASE,
      url: BASE_URL,
      siteName: NOME_APP,
      images: [{ url: `${BASE_URL}/og-image.webp`, width: 1200, height: 630 }],
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${NOME_APP} — Orçamentos de Obras com IA`,
      description: DESCRICAO_BASE,
    },
  },

  planos: {
    title: `Planos e Preços | ${NOME_APP}`,
    description: `Compare os planos do ${NOME_APP}: comece grátis e acesse BDI, SINAPI, relatórios em PDF e muito mais.`,
    keywords: KW.planos,
  },

  login: {
    title: `Entrar | ${NOME_APP}`,
    description: `Acesse sua conta ${NOME_APP} para gerenciar seus orçamentos de obras.`,
    keywords: KW.login,
    robots: { index: false, follow: false },
  },

  dashboard: {
    title: `Painel | ${NOME_APP}`,
    description: `Gerencie todos os seus orçamentos de obra em um único lugar.`,
    keywords: KW.dashboard,
    robots: { index: false, follow: false },
  },

  'novo-diagnostico': {
    title: `Novo Diagnóstico Visual | ${NOME_APP}`,
    description: 'Crie um diagnóstico técnico visual da obra com análise de imagens por IA.',
    robots: { index: false, follow: false },
  },

  'relatorio-fotografico': {
    title: `Relatório Fotográfico | ${NOME_APP}`,
    description: 'Gere relatórios fotográficos profissionais de obras com legendas e análise automática.',
    robots: { index: false, follow: false },
  },

  topografia: {
    title: `Topografia | ${NOME_APP}`,
    description: 'Ferramentas de topografia integradas ao sistema de orçamentos ObraPlana.',
  },

  sobre: {
    title: `Sobre o ${NOME_APP}`,
    description: `Conheça a história e a missão do ${NOME_APP}: simplificar orçamentos de construção civil com tecnologia e IA.`,
  },

  contato: {
    title: `Contato | ${NOME_APP}`,
    description: `Entre em contato com a equipe ${NOME_APP}. Suporte, dúvidas e parcerias.`,
  },

  apoie: {
    title: `Apoie o ${NOME_APP}`,
    description: `Apoie o desenvolvimento do ${NOME_APP} e ajude a democratizar orçamentos profissionais de obras.`,
  },

  privacidade: {
    title: `Política de Privacidade | ${NOME_APP}`,
    description: `Saiba como o ${NOME_APP} coleta, usa e protege seus dados pessoais em conformidade com a LGPD.`,
    keywords: KW.privacidade,
  },

  termos: {
    title: `Termos de Uso | ${NOME_APP}`,
    description: `Leia os termos de uso do ${NOME_APP} antes de utilizar a plataforma.`,
  },

  admin: {
    title: `Admin | ${NOME_APP}`,
    robots: { index: false, follow: false },
  },
}

// ── Função principal ─────────────────────────────────────────────
export function getMetadata(pagina: keyof typeof PAGINAS): Metadata {
  const base: Metadata = {
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: BASE_URL },
  }
  return { ...base, ...PAGINAS[pagina] }
}

// ── Metadata para páginas dinâmicas ─────────────────────────────
export function getMetadataDinamica(
  tipo: 'editor' | 'report' | 'editor-diagnostico' | 'relatorio-fotografico',
  dados: { titulo?: string; id?: string }
): Metadata {
  const base: Metadata = {
    metadataBase: new URL(BASE_URL),
    robots: { index: false, follow: false },
  }

  switch (tipo) {
    case 'editor':
      return {
        ...base,
        title: dados.titulo ? `${dados.titulo} | Editor | ${NOME_APP}` : `Novo Orçamento | ${NOME_APP}`,
        description: `Edite o orçamento "${dados.titulo ?? 'sem título'}" no ${NOME_APP}.`,
      }
    case 'report':
      return {
        ...base,
        title: dados.titulo ? `Relatório: ${dados.titulo} | ${NOME_APP}` : `Relatório de Orçamento | ${NOME_APP}`,
        description: `Visualize e exporte o relatório do orçamento "${dados.titulo ?? ''}" em PDF.`,
      }
    case 'editor-diagnostico':
      return {
        ...base,
        title: `Diagnóstico Visual | ${NOME_APP}`,
        description: 'Edite o diagnóstico técnico visual da obra.',
      }
    case 'relatorio-fotografico':
      return {
        ...base,
        title: `Relatório Fotográfico | ${NOME_APP}`,
        description: 'Relatório fotográfico técnico da obra.',
      }
  }
}

// ── Structured Data (JSON-LD) para a home ────────────────────────
export const jsonLdHome = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: NOME_APP,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: DESCRICAO_BASE,
  url: BASE_URL,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
    description: 'Plano gratuito disponível',
  },
  inLanguage: 'pt-BR',
}
