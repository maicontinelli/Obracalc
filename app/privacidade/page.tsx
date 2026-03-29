import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | ObraPlana',
  description: 'Saiba como o ObraPlana coleta, usa e protege seus dados pessoais em conformidade com a LGPD.',
}

export default function PrivacidadePage() {
  const ultimaAtualizacao = '28 de março de 2026'

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: {ultimaAtualizacao}
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Quem somos</h2>
            <p>
              O <strong>ObraPlana</strong> é uma plataforma online de orçamentos inteligentes para
              construção civil, desenvolvida e operada por <strong>ObraPlana Tecnologia Ltda</strong>
              (ou a pessoa física responsável pelo serviço), com sede no Brasil.
            </p>
            <p className="mt-2">
              Contato: <a href="mailto:privacidade@obraplana.app" className="text-primary hover:underline">
                privacidade@obraplana.app
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Dados que coletamos</h2>
            <p>Coletamos apenas os dados necessários para fornecer o serviço:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Dados de cadastro:</strong> nome, e-mail e senha (ou conta Google/GitHub via OAuth)</li>
              <li><strong>Dados profissionais (opcionais):</strong> empresa, CREA, telefone, cidade e estado</li>
              <li><strong>Dados dos orçamentos:</strong> títulos, descrições, itens e valores inseridos por você</li>
              <li><strong>Dados de uso:</strong> páginas visitadas, ações realizadas e tempo de sessão (via logs anônimos)</li>
              <li><strong>Dados de pagamento:</strong> processados diretamente pela AbacatePay — não armazenamos dados de cartão</li>
              <li><strong>Cookies técnicos:</strong> necessários para autenticação e preferências de tema</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecer, manter e melhorar o serviço ObraPlana</li>
              <li>Processar pagamentos e gerenciar sua assinatura</li>
              <li>Enviar comunicações sobre seu plano, atualizações e novidades (você pode cancelar a qualquer momento)</li>
              <li>Prevenir fraudes e garantir a segurança da plataforma</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Compartilhamento de dados</h2>
            <p>Não vendemos seus dados. Compartilhamos apenas com:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Supabase:</strong> banco de dados e autenticação (servidores na AWS, região us-west-2)</li>
              <li><strong>Vercel:</strong> hospedagem da aplicação</li>
              <li><strong>AbacatePay:</strong> processamento de pagamentos</li>
              <li><strong>OpenAI / Anthropic:</strong> processamento de prompts de IA (sem armazenamento permanente)</li>
            </ul>
            <p className="mt-2">
              Todos os nossos parceiros são obrigados contratualmente a proteger seus dados e não
              utilizá-los para fins próprios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Seus direitos (LGPD)</h2>
            <p>Nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Confirmação:</strong> saber se tratamos seus dados</li>
              <li><strong>Acesso:</strong> receber cópia dos seus dados</li>
              <li><strong>Correção:</strong> corrigir dados incompletos ou incorretos</li>
              <li><strong>Exclusão:</strong> solicitar a exclusão de dados desnecessários</li>
              <li><strong>Portabilidade:</strong> exportar seus dados em formato estruturado</li>
              <li><strong>Revogação do consentimento:</strong> cancelar o consentimento dado anteriormente</li>
              <li><strong>Oposição:</strong> opor-se a tratamento baseado em legítimo interesse</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, envie um e-mail para{' '}
              <a href="mailto:privacidade@obraplana.app" className="text-primary hover:underline">
                privacidade@obraplana.app
              </a>{' '}
              com o assunto &quot;Direitos LGPD&quot;. Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Retenção de dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento, seus dados
              são mantidos por até 90 dias (para eventual reativação) e depois excluídos
              automaticamente, salvo obrigação legal de retenção.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Segurança</h2>
            <p>
              Utilizamos criptografia em trânsito (HTTPS/TLS), autenticação segura via Supabase Auth,
              Row-Level Security no banco de dados (cada usuário acessa apenas seus próprios dados)
              e monitoramento contínuo de acessos suspeitos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
            <p>Usamos apenas cookies estritamente necessários:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>sb-auth-token:</strong> sessão de autenticação (Supabase)</li>
              <li><strong>theme:</strong> preferência de tema claro/escuro</li>
            </ul>
            <p className="mt-2">
              Não usamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Menores de idade</h2>
            <p>
              O ObraPlana é destinado a profissionais e não deve ser usado por menores de 18 anos.
              Se identificarmos cadastros de menores, encerraremos a conta e excluiremos os dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Em caso de mudanças significativas,
              notificaremos por e-mail ou aviso na plataforma com pelo menos 15 dias de antecedência.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contato e DPO</h2>
            <p>
              Dúvidas, solicitações ou reclamações sobre privacidade:{' '}
              <a href="mailto:privacidade@obraplana.app" className="text-primary hover:underline">
                privacidade@obraplana.app
              </a>
            </p>
            <p className="mt-2">
              Você também pode registrar uma reclamação junto à ANPD (Autoridade Nacional de
              Proteção de Dados) em{' '}
              <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer"
                className="text-primary hover:underline">
                www.gov.br/anpd
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
