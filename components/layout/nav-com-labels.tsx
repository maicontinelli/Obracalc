'use client'

/**
 * ObraPlana — Navegação Flutuante com Labels
 *
 * Substitui o nav atual (icons sem labels) por uma versão com:
 * - Tooltips visíveis ao hover no desktop
 * - Labels visíveis abaixo dos ícones no mobile
 * - Estado ativo por rota
 * - Texto "Entrar" sempre visível
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Gem, LogIn, LayoutDashboard, PlusCircle, FileText, Settings } from 'lucide-react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  tooltip: string
  onlyWhenLoggedIn?: boolean
  highlight?: boolean
}

const NAV_PUBLICO: NavItem[] = [
  { href: '/',       icon: Home,   label: 'Início',  tooltip: 'Página inicial' },
  { href: '/planos', icon: Gem,    label: 'Planos',  tooltip: 'Compare planos e preços' },
]

const NAV_LOGADO: NavItem[] = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Painel',     tooltip: 'Seus orçamentos' },
  { href: '/dashboard',   icon: PlusCircle,      label: 'Novo',       tooltip: 'Criar novo orçamento', highlight: true },
  { href: '/planos',       icon: Gem,             label: 'Planos',     tooltip: 'Comparar planos' },
]

interface Props {
  isLoggedIn?: boolean
  userName?: string
}

export function NavComLabels({ isLoggedIn = false, userName }: Props) {
  const pathname = usePathname()
  const items = isLoggedIn ? NAV_LOGADO : NAV_PUBLICO

  return (
    <div className="fixed top-4 left-0 right-0 z-50 pointer-events-none px-4">
      <div className="max-w-7xl mx-auto flex justify-center sm:justify-end items-center pointer-events-none">
        <nav
          className="flex items-center gap-0.5 sm:gap-1 bg-white/80 dark:bg-[#1a1918]/80 backdrop-blur-md px-2 py-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] pointer-events-auto"
          aria-label="Navegação principal"
        >
          {items.map((item) => {
            const ativo = pathname === item.href
            const Icon = item.icon

            return (
              <div key={item.href + item.label} className="relative group">
                <Link
                  href={item.href}
                  title={item.tooltip}
                  className={`
                    flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all
                    ${ativo
                      ? 'bg-primary/10 text-primary'
                      : item.highlight
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5 hover:text-orange-500'
                    }
                  `}
                  aria-current={ativo ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className={`text-[10px] font-medium leading-none ${item.highlight ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </Link>

                {/* Tooltip desktop */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded-lg text-xs text-popover-foreground whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {item.tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
                </div>
              </div>
            )
          })}

          {/* Separador */}
          <div className="h-5 w-px mx-1 bg-gray-200/50 dark:bg-white/10" />

          {/* Botão Entrar / Avatar */}
          {isLoggedIn ? (
            <div className="relative group">
              <button
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all"
                title="Configurações da conta"
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
                <span className="text-[10px] font-medium leading-none">
                  {userName?.split(' ')[0] ?? 'Conta'}
                </span>
              </button>
            </div>
          ) : (
            <div className="relative group">
              <Link
                href="/login"
                title="Entrar na sua conta"
                className="flex items-center gap-1.5 bg-[#FF6600] hover:bg-[#E55C00] text-white px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-lg shadow-[#FF6600]/20 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Entrar</span>
              </Link>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded-lg text-xs text-popover-foreground whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Entrar ou criar conta
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}
