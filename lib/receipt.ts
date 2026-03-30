/**
 * Generates and downloads a simple PDF receipt using jsPDF.
 * Runs entirely in the browser (no API route needed).
 */
export interface ReceiptData {
    userName: string;
    userEmail: string;
    plan: string;
    amount: string;       // e.g. "R$ 39,00"
    paymentDate: string;  // ISO string or formatted date
    document?: string;    // CPF/CNPJ
    orderId?: string;     // AbacatePay billing ID (optional)
}

export async function downloadReceipt(data: ReceiptData): Promise<void> {
    // Dynamic import to avoid SSR issues (jsPDF is browser-only)
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentW = pageW - margin * 2;

    // ── Colors ──────────────────────────────────────────────────────────────
    const orange: [number, number, number] = [13, 148, 136];
    const dark: [number, number, number] = [30, 30, 30];
    const gray: [number, number, number] = [120, 120, 120];
    const lightGray: [number, number, number] = [240, 240, 240];

    let y = margin;

    // ── Header band ─────────────────────────────────────────────────────────
    doc.setFillColor(...orange);
    doc.rect(0, 0, pageW, 40, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('ObraPlana', margin, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Recibo de Pagamento', margin, 28);

    y = 55;

    // ── Order info ───────────────────────────────────────────────────────────
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text('DATA DO PAGAMENTO', margin, y);
    doc.text('Nº DO PEDIDO', margin + contentW / 2, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...dark);

    const formattedDate = data.paymentDate
        ? new Date(data.paymentDate).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric',
        })
        : 'N/A';

    doc.text(formattedDate, margin, y);
    doc.text(data.orderId ? `#${data.orderId.slice(0, 12).toUpperCase()}` : 'N/A', margin + contentW / 2, y);

    y += 12;

    // ── Divider ──────────────────────────────────────────────────────────────
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // ── Customer section ─────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text('CLIENTE', margin, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...dark);
    doc.text(data.userName || 'N/A', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text(data.userEmail, margin, y);
    if (data.document) {
        y += 5;
        doc.text(`CPF/CNPJ: ${data.document}`, margin, y);
    }
    y += 14;

    // ── Product table ────────────────────────────────────────────────────────
    doc.setFillColor(...lightGray);
    doc.rect(margin, y, contentW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text('DESCRIÇÃO', margin + 3, y + 5.5);
    doc.text('VALOR', pageW - margin - 3, y + 5.5, { align: 'right' });
    y += 8;

    // Product row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    doc.text(`Plano ${data.plan} — Acesso Anual`, margin + 3, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(data.amount, pageW - margin - 3, y + 7, { align: 'right' });
    y += 16;

    // ── Divider ──────────────────────────────────────────────────────────────
    doc.setDrawColor(...lightGray);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // ── Total ────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.text('TOTAL', margin, y);
    doc.setTextColor(...orange);
    doc.text(data.amount, pageW - margin - 3, y, { align: 'right' });
    y += 18;

    // ── Guarantee note ────────────────────────────────────────────────────────
    doc.setFillColor(240, 255, 244);
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(margin, y, contentW, 24, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 163, 74);
    doc.text('🛡️  Garantia Incondicional de 14 dias', margin + 5, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text(
        'Se não estiver satisfeito, solicite o reembolso integral em até 14 dias.',
        margin + 5, y + 13
    );
    doc.text(
        'O valor será devolvido em até 7 dias úteis para a conta de origem.',
        margin + 5, y + 19
    );
    y += 34;

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text('ObraPlana — www.obraplana.app', margin, y);
    doc.text('Dúvidas? Acesse obraplana.app/contato', pageW - margin - 3, y, { align: 'right' });

    doc.save(`recibo-obraplana-${data.plan.toLowerCase()}.pdf`);
}
