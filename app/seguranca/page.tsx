import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Segurança | ObraPlana',
  description: 'Saiba como o ObraPlana protege seus dados e garante a segurança da sua conta.',
}

export default function SegurancaPage() {
  const ultimaAtualizacao = '28 de março de 2026'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 max-w-3xl py-20">

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Segurança</h1>
          <p className="text-sm text-muted-foreground">Última atualização: {ultimaAtualizacao}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Proteção de Dados em Trânsito</h2>
            <p className="text-muted-foreground leading-relaxed">
              Toda a comunicação entre seu dispositivo e os servidores do ObraPlana é criptografada utilizando
              TLS 1.2 ou superior (HTTPS). Isso garante que seus dados não possam ser interceptados durante
              a transmissão.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Armazenamento Seguro</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os dados são armazenados na infraestrutura do Supabase, que conta com criptografia em repouso,
              backups automáticos e conformidade com os principais padrões de segurança internacionais
              (SOC 2 Type II, ISO 27001).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Autenticação</h2>
            <p className="text-muted-foreground leading-relaxed">
              O ObraPlana oferece múltiplos métodos de autenticação seguros:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Login com e-mail e senha (hash bcrypt)</li>
              <li>Magic Link — acesso por e-mail sem senha</li>
              <li>OAuth via Google</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Senhas nunca são armazenadas em texto puro. Recomendamos o uso de senhas únicas e longas
              para proteger sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Controle de Acesso</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cada usuário tem acesso apenas aos seus próprios dados. As políticas de segurança em nível de
              linha (RLS — Row Level Security) do Supabase garantem que nenhum usuário possa acessar os
              orçamentos, projetos ou informações de outro usuário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Dados de Pagamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              O ObraPlana não armazena dados de cartão de crédito. Todo o processamento de pagamentos é
              realizado diretamente pela AbacatePay, plataforma certificada PCI-DSS. Apenas o status da
              assinatura e dados não sensíveis são mantidos em nossos servidores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Monitoramento e Incidentes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Monitoramos continuamente a plataforma em busca de atividades suspeitas. Em caso de incidente
              de segurança que afete seus dados, você será notificado por e-mail dentro do prazo exigido
              pela LGPD (Lei Geral de Proteção de Dados).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Boas Práticas Recomendadas</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Use uma senha forte e exclusiva para o ObraPlana</li>
              <li>Não compartilhe suas credenciais de acesso</li>
              <li>Faça logout em dispositivos compartilhados</li>
              <li>Mantenha seu e-mail de recuperação atualizado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contato de Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para reportar vulnerabilidades ou incidentes de segurança, entre em contato pelo e-mail:{' '}
              <a href="mailto:seguranca@obraplana.app" className="text-[#0D9488] hover:underline">
                seguranca@obraplana.app
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
