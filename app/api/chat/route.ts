import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave de API do GROQ não configurada." },
        { status: 500 }
      );
    }

    // PROMPT MINIMALISTA para economizar tokens durante testes
    const systemPrompt = `Você é um engenheiro civil especializado em orçamentos.

REGRAS:
1. Retorne APENAS JSON válido
2. Se faltar info → use "clarificationRequest"
3. Inclua preparação + execução + acabamento
4. Calcule laborPrice (40%) e materialPrice (60%)
5. Ordem cronológica
6. Use UMA ÚNICA categoria descritiva baseada no pedido do usuário (ex: "PINTURA", "CONSTRUÇÃO", "REFORMA")

FORMATO:
{
  "text": "Explicação breve (2-3 linhas)",
  "clarificationRequest": null ou "perguntas",
  "suggestedBudget": {
    "title": "Nome do Serviço",
    "type": "material_labor",
    "projectArea": 0,
    "items": [{
      "name": "Descrição do Serviço",
      "unit": "m²",
      "quantity": 10,
      "price": 100,
      "laborPrice": 40,
      "materialPrice": 60,
      "category": "CATEGORIA DESCRITIVA",
      "included": true,
      "type": "service"
    }]
  }
}

IMPORTANTE: Todos os itens devem ter a MESMA categoria descritiva (sem números).`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
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
    console.error("Error calling Google Gemini API:", error);
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
