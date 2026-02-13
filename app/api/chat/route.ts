import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave de API do GROQ não configurada." },
        { status: 500 }
      );
    }

    // PROMPT OBRACALC - ENGENHEIRO CIVIL
    const systemPrompt = `Você é um engenheiro civil sênior, especialista em orçamentos.

MODO ECONÔMICO DE OPERAÇÃO:
1. FASE DE CONSULTORIA (Perguntas):
   - MÁXIMO 1 RODADA DE PERGUNTAS (Seja assertivo).
   - Se faltar dados vitais, faça TODAS as perguntas de uma vez (Bullet points).
   - Se o usuário já respondeu, EVITE novas perguntas. Assuma padrões de mercado para o que faltar e avise no texto.
   - Só pergunte de novo se a resposta for totalmente incompreensível.

2. FASE DE GERAÇÃO (Orçamento Final):
   - Ao receber a resposta da rodada de perguntas, GERE IMEDIATAMENTE O ORÇAMENTO.
   - NÃO faça "segunda rodada" de refinamento. Assuma o padrão mais comum.
   - SEJA PROATIVO E COMPLETO: Adicione itens correlatos (preparação, lixa, limpeza, retirada de entulho). Melhor sobrar itens para o usuário apagar do que faltar.
   - "clarificationRequest" deve ser null nesta fase.

REGRAS DE INTERAÇÃO:
- "clarificationRequest": String única com múltiplos pontos.
- "text": Breve comentário técnico.

REGRAS TÉCNICAS (QUANDO GERAR ORÇAMENTO):
1. TÍTULO DETALHADO OBRIGATÓRIO: Formato "Serviço + Local + Quantidade/Área" (Ex: "Pintura de Muro - Área Externa - 30m²"). NUNCA use títulos genéricos como "Orçamento" ou "Pintura".
2. SEJA EXAUSTIVO NOS ITENS: Não resuma. Quebre em etapas lógicas se necessário (ex: 1. Preparo, 2. Fundo, 3. Acabamento).
3. NUNCA separe material e mão de obra em linhas diferentes. TUDO é composição.
4. CRIE COMPOSIÇÕES DE SERVIÇO COMPLETAS: O preço deve englobar tudo (Mão de Obra + Material).
   - Item 1: "Preparo de Superfície (lixamento + fundo preparador)" - R$ 15,00/m²
   - Item 2: "Pintura Acrílica Premium 2 demãos" - R$ 45,00/m²
5. Use sempre type: "service".
6. LÓGICA DE QUANTIDADES PARA OBRAS GLOBAIS (CASA COMPLETA / REFORMAS):
   - Se o usuário pedir "uma casa de X m²", NÃO use "X" para todos os itens.
   - Paredes/Pintura/Reboco: Use o ratio de 2.5x a 3x a área de piso para calcular a área de paredes. (Ex: Casa 90m² = ~250m² de pintura).
   - Telhado: Use a área de piso + 25% (inclinação e beiral).
   - REFERÊNCIA CUB 2024/2025 (Estimativa para validação do TOTAL):
     * Padrão Popular: R$ 1.950,00 a R$ 2.100,00 por m²
     * Padrão Normal/Médio: R$ 2.250,00 a R$ 2.500,00 por m²
     * Padrão Alto: R$ 2.800,00 a R$ 3.500,00+ por m²
   - REGRA DE OURO: O somatório final de todos os itens do orçamento (suggestedBudget.items) DIVIDIDO pela metragem pedida DEVE obrigatoriamente estar dentro destas faixas. Se os preços unitários ficarem baixos demais, AUMENTE-OS proporcionalmente para refletir a realidade do CUB.
7. AGRUPE TUDO EM UMA ÚNICA CATEGORIA PRINCIPAL:
   - TODOS os itens da lista devem ter EXATAMENTE a mesma string no campo "category".
   - O nome da categoria deve ser o resumo do pedido: "SERVIÇO - LOCAL - QUANTIDADE" (Ex: "PINTURA DE MURO - 20M²").
   - NUNCA use categorias genéricas como "Materiais" ou "Diversos".
   - NUNCA separe em categorias diferentes para etapas diferentes. Use a MESMA categoria para Lixa, Tinta e Mão de Obra.

FORMATO JSON OBRIGATÓRIO:
{
  "text": "Comentário.",
  "clarificationRequest": "Pergunta 1\n- Detalhe A\n- Detalhe B" || null,
  "suggestedBudget": {
    "title": "Título",
    "type": "material_labor",
    "projectArea": 0,
    "items": [{
      "name": "Nome da Composição (Serviço + Material incluso)",
      "unit": "m²",
      "quantity": 0,
      "price": 0,
      "laborPrice": 0,
      "materialPrice": 0,
      "category": "CATEGORIA",
      "included": true,
      "type": "service"
    }]
  } || null
}`;

    // Monta histórico de mensagens para manter o contexto
    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content || msg.text // Handle both potential formats
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erro na API GROQ");
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "";

    let parsedResponse;
    try {
      // Clean up any potential markdown or extra text
      let cleanedResponse = aiResponse.trim();
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
      cleanedResponse = cleanedResponse.replace(/^```\s*/i, "").replace(/\s*```$/i, "");

      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", aiResponse);
      // Fallback: return text-only response
      parsedResponse = {
        text: aiResponse,
        suggestedBudget: null
      };
    }

    return NextResponse.json(parsedResponse);

  } catch (error: any) {
    console.error("Error calling Groq API:", error);
    return NextResponse.json(
      {
        error: error?.message || "Falha ao processar solicitação com a IA.",
        text: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        suggestedBudget: null
      },
      { status: 500 }
    );
  }
}
