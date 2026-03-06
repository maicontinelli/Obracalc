import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Termos de Uso | ObraPlana',
    description: 'Termos de Uso, Política de Cancelamento e Garantia Incondicional de 14 dias do ObraPlana.',
};

const LAST_UPDATED = '19 de fevereiro de 2026';

export default function TermosPage() {
    return (
        <main className="min-h-screen bg-background py-16 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-1"
                    >
                        ← Voltar ao início
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground mt-4 mb-2">
                        Termos de Uso
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Última atualização: {LAST_UPDATED}
                    </p>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground/90">

                    {/* 1 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">1. Aceitação dos Termos</h2>
                        <p>
                            Ao criar uma conta ou contratar qualquer plano do <strong>ObraPlana</strong>, você concorda integralmente com estes Termos de Uso e com nossa Política de Cancelamento. Se não concordar, não utilize o serviço.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">2. Serviço Oferecido</h2>
                        <p>
                            O ObraPlana é uma plataforma SaaS de criação e gestão de orçamentos técnicos para profissionais da construção civil. O acesso é fornecido mediante assinatura ou pagamento único, conforme o plano contratado.
                        </p>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">3. Planos e Pagamentos</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Os planos pagos são <strong>Profissional</strong> (mensal ou anual) e <strong>Empresarial</strong> (mensal ou anual).</li>
                            <li>O plano <strong>Básico</strong> é de pagamento único e não gera cobranças recorrentes.</li>
                            <li>Planos recorrentes são cobrados automaticamente na data de renovação via <strong>PIX ou cartão de crédito</strong>, processados pelo gateway AbacatePay.</li>
                            <li>Em caso de falha no pagamento, você receberá notificação e terá 72h para regularizar. Após 2 falhas consecutivas, o acesso será suspenso.</li>
                        </ul>
                    </section>

                    {/* 4 — Garantia */}
                    <section className="border border-[#74D2E7]/40 bg-[#74D2E7]/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-foreground mb-3">
                            4. Garantia Incondicional de 14 Dias 🛡️
                        </h2>
                        <p className="mb-3">
                            Se por qualquer motivo você não estiver satisfeito com o ObraPlana, poderá solicitar o cancelamento e o <strong>reembolso integral</strong> dentro de <strong>14 dias corridos</strong> a partir da data do pagamento.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Sem perguntas ou burocracia.</li>
                            <li>O reembolso é processado em até <strong>7 dias úteis</strong> para a conta de origem.</li>
                            <li>Para solicitar, clique em <em>"Cancelar Assinatura"</em> no seu dashboard ou entre em contato via <Link href="/contato" className="text-[#74D2E7] hover:underline">nossa página de contato</Link>.</li>
                            <li>Após o período de 14 dias, cancelamentos encerram o acesso ao fim do ciclo de cobrança vigente, <strong>sem reembolso proporcional</strong>.</li>
                        </ul>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">5. Política de Cancelamento</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Você pode cancelar sua assinatura a qualquer momento pelo dashboard ou pelo suporte.</li>
                            <li>Após o cancelamento, seu acesso permanece ativo até o fim do período pago.</li>
                            <li>Dados e orçamentos ficam disponíveis para exportação por <strong>30 dias</strong> após o cancelamento.</li>
                            <li>Após 30 dias do cancelamento, os dados poderão ser removidos permanentemente.</li>
                        </ul>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">6. Uso Aceitável</h2>
                        <p>É proibido usar o ObraPlana para:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Atividades ilegais ou fraudulentas.</li>
                            <li>Compartilhar acesso entre múltiplos usuários em planos individuais.</li>
                            <li>Engenharia reversa ou extração massiva de dados da plataforma.</li>
                        </ul>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">7. Propriedade Intelectual</h2>
                        <p>
                            Todo o conteúdo gerado pelos usuários (orçamentos, dados de projetos) pertence ao usuário. O código, design e marca ObraPlana são propriedade exclusiva da empresa. A assinatura concede uma licença de uso não-exclusiva e intransferível da plataforma.
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">8. Limitação de Responsabilidade</h2>
                        <p>
                            O ObraPlana fornece estimativas e suporte técnico, mas não substitui a avaliação profissional de engenheiros ou arquitetos habilitados. A responsabilidade técnica final pelos orçamentos é do profissional que os emite.
                        </p>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">9. Alterações nestes Termos</h2>
                        <p>
                            Podemos atualizar estes Termos periodicamente. Você será notificado por email com 15 dias de antecedência sobre mudanças significativas. O uso continuado após a vigência das alterações implica aceitação.
                        </p>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">10. Foro e Legislação</h2>
                        <p>
                            Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de <strong>São Paulo - SP</strong> para dirimir quaisquer controvérsias.
                        </p>
                    </section>

                    {/* Footer note */}
                    <div className="border-t border-border pt-8 text-sm text-muted-foreground">
                        <p>
                            Dúvidas? Entre em contato:{' '}
                            <Link href="/contato" className="text-[#74D2E7] hover:underline">
                                Página de Contato
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
