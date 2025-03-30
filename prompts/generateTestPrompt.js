const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateTestFromPrompt(instruction) {
    const messages = [
        {
            role: 'system',
            content: `
                Você é um gerador de testes automatizados para APIs REST usando Jest e Axios no Node.js.

                Suas instruções são as seguintes:

                - Gere **apenas** código JavaScript entre blocos javascript.
                - **Não escreva comentários, explicações ou qualquer texto fora do bloco de código.**
                - Para cada cenário, gere um 'test()' isolado, com nomes claros e distintos.
                - Os test() precisam ser descritos em portuguẽs.
                - **Use sempre try/catch** dentro de cada 'test()' para capturar erros do Axios.
                - Para verificações de status, use 'expect([200, 400, 401, 429]).toContain(...)' quando aplicável.
                - Evite 'expect(response.status).toBe(XXX)' fixo em testes onde a API pode variar.
                - Nunca use 'console.log', 'console.error' ou qualquer output fora dos testes.
                - Evite reuso de variáveis entre testes (evita conflito ou vazamento de contexto).
                - Se a resposta esperada for sucesso, valide também que a resposta possui 'data.token' com 'expect(response.data).toHaveProperty('token')'.

                Seu objetivo é gerar código que **nunca cause falha de execução no Jest**, mesmo que a API retorne erro ou bloqueie (rate-limit).

            `,
            
        },
        {
            role: 'user',
            content: instruction
        }
    ];

    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.2
    });

    return completion.choices[0].message.content;
}

module.exports = { generateTestFromPrompt };