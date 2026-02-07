# 🚀 Migração para Google Gemini API

## ✅ Por que Gemini em vez de GROQ?

### Limites Gratuitos - Comparação

| Recurso | GROQ (Free) | Google Gemini (Free) |
|---------|-------------|---------------------|
| **Requisições/minuto** | ~30 | 15 |
| **Tokens/minuto** | ~6.000 | 1.000.000 |
| **Requisições/dia** | ~14.400 | 1.500 |
| **Custo** | Grátis | Grátis |
| **Qualidade** | Llama 3.3 70B | Gemini 1.5 Flash |

### Vantagens do Gemini:

1. ✅ **1 milhão de tokens/minuto** - Muito mais generoso
2. ✅ **Grátis permanentemente** para uso moderado
3. ✅ **Já instalado** no projeto (`@google/generative-ai`)
4. ✅ **Resposta JSON nativa** - Melhor estruturação
5. ✅ **Rápido e eficiente** - Gemini 1.5 Flash é otimizado para chatbots

## 📋 Como Obter sua API Key

### Passo 1: Acesse o Google AI Studio
1. Vá para: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google

### Passo 2: Crie uma API Key
1. Clique em **"Create API Key"**
2. Selecione um projeto do Google Cloud (ou crie um novo)
3. Copie a chave gerada

### Passo 3: Configure no Projeto
Adicione no arquivo `.env.local`:

```bash
GEMINI_API_KEY=AIzaSy...sua_chave_aqui
```

## 🔧 O que foi Alterado

### 1. API Route (`app/api/chat/route.ts`)
- ✅ Substituído fetch do GROQ por Google Gemini SDK
- ✅ Mantido o mesmo system prompt
- ✅ Configurado `responseMimeType: "application/json"` para garantir JSON

### 2. Componente UI (`components/AiAssistant.tsx`)
- ✅ Atualizada mensagem de erro para referenciar `GEMINI_API_KEY`

### 3. Variáveis de Ambiente
- ✅ `GEMINI_API_KEY` já configurada no `.env.local`
- ⚠️ `GROQ_API_KEY` pode ser removida (opcional)

## 🧪 Testando a Migração

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Teste na barra de pesquisa:**
   - Vá para a página inicial
   - Digite: "pintar uma sala de 20m²"
   - Verifique se a IA responde normalmente

3. **Monitore os logs:**
   - Verifique o console para erros
   - A resposta deve ser rápida (< 3 segundos)

## 📊 Monitoramento de Uso

Para ver seu uso da API Gemini:
1. Acesse: https://aistudio.google.com/app/apikey
2. Clique na sua API key
3. Veja estatísticas de uso

## 🚨 Troubleshooting

### Erro: "API key not valid"
- Verifique se a chave está correta no `.env.local`
- Certifique-se de que não há espaços extras
- Reinicie o servidor (`npm run dev`)

### Erro: "Quota exceeded"
- Você atingiu o limite diário (1.500 requisições)
- Aguarde 24 horas ou crie outra API key

### Resposta lenta
- Gemini 1.5 Flash é rápido (~2s)
- Se estiver lento, verifique sua conexão
- Considere usar cache para requisições repetidas

## 💡 Próximos Passos (Opcional)

### Para Produção com Alto Volume:
1. **Gemini Pro** (Pago):
   - 360 requisições/minuto
   - 4 milhões de tokens/minuto
   - ~$0.50 por 1M tokens

2. **Implementar Cache**:
   - Armazene respostas comuns
   - Reduza chamadas à API

3. **Rate Limiting**:
   - Limite requisições por usuário
   - Evite abuso

## 📚 Recursos

- [Documentação Gemini API](https://ai.google.dev/docs)
- [Pricing](https://ai.google.dev/pricing)
- [Exemplos de Código](https://github.com/google/generative-ai-js)

---

**Migração concluída em:** 05/02/2026  
**Status:** ✅ Funcionando  
**Próximo Deploy:** Incluir esta mudança
