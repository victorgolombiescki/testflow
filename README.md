🎥 Tutorial: Apresentando o TestFlow AI - Gerador de Testes Automatizados para APIs REST

teste-1.gif21

🎯 O que vamos fazer neste vídeo:

1. Clonar o projeto TestFlow AI
2. Entender cada arquivo
3. Configurar as variáveis de ambiente
4. Subir o PostgreSQL com Docker Compose
5. Rodar as migrações com Prisma
6. Iniciar a aplicação Node.js e acessar a interface web
7. Gerar, Executar testes automatizados com IA e ver o resultado ao vivo
8. Salvar e listar execuções no banco de dados e reexecutar, baixar ou excluir testes anteriores

🔧 Tecnologias Utilizadas:
```
Node.js + Express
Prisma ORM
PostgreSQL (via Docker)
OpenAI API (GPT-4)
Jest para execução dos testes
HTML + CSS + Bootstrap Icons para a interface
```
Jest é um framework de testes para aplicações JavaScript e TypeScript, criado pelo Facebook.

Ele é usado para:

* 🧪 Escrever e rodar testes automatizados
* ✅ Verificar se o código está funcionando como esperado
* 🚀 Executar testes rapidamente com resultados claros

É muito usado em projetos Node.js e React, e já vem com tudo pronto.

---

📁 Estrutura do Projeto
```
api-tester-ia/
├── Dockerfile
├── docker-compose.yml
├── .env
├── app.js
├── prompts/
│   └── generateTestPrompt.js
├── test-runner.js
├── tests/
│   └── generated.test.js (gerado dinamicamente)
├── reports/
│   └── test-report.json (gerado dinamicamente)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── index.html
```
---

⚙️ Configuração Inicial

1. Variáveis de Ambiente (.env)
```
OPENAI_API_KEY=your_openai_key
DATABASE_URL=postgres://postgres:postgres@db-alt:5432/testdb
```
2. Docker Compose (docker-compose.yml)

```
services:
  api-tester-ia:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/usr/src/app
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
    command: npm start

  db-alt:
    image: postgres:15
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
```
3. Prisma (schema.prisma)
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model TestExecution {
  id          String   @id @default(uuid())
  instruction String
  code        String
  report      Json
  testFile    String
  reportFile  String
  createdAt   DateTime @default(now())
}
```

---

🧠 Geração de Testes com IA (generateTestPrompt.js)

Gera código de teste com base na instrução do usuário utilizando OpenAI (GPT-4). Segue um prompt rígido para garantir boas práticas.

---

🧪 Execução dos Testes (test-runner.js)

Executa os testes usando Jest e salva o relatório JSON em reports/test-report.json.

---

🌐 Backend Express (app.js)

* Endpoint /generate-and-run:
  * Recebe a instrução
  * Gera teste via OpenAI
  * Salva teste e executa com Jest
  * Retorna relatório formatado
* Endpoint /executions:
  * Lista todas execuções registradas no banco
* Endpoint /executions/:id (DELETE):
  * Exclui execução específica
* Servidor roda na porta 3000

---

💻 Interface Web (public/index.html)

* Design moderno com Bootstrap Icons
* Entrada para instrução do teste
* Loader animado durante execução
* Resultado exibido com destaque visual
* Histórico com reexecução e exclusão

---

✅ Como Executar

1. Rode o banco de dados com Docker Compose:
```
docker-compose up -d
```
1. Rode as migrações Prisma:
```
npx prisma migrate dev --name init
```

1. Acesse: http://localhost:3000
2. Digite a instrução, clique em Executar Teste, e veja o resultado ao vivo.

---

🧪 Vamos testar

🔹 1. Consulta simples — API de Países
```
"Crie um teste para fazer uma requisição GET para https://restcountries.com/v3.1/name/brazil e verificar se retorna status 200."
```
📌 API: https://restcountries.com/v3.1/name/brazil
🧪 Ideal para mostrar retorno rápido e dados bem estruturados.

---

🔹 2. Erro esperado — País inexistente
```
"Crie um teste para buscar um país inexistente na API https://restcountries.com/v3.1/name/zzzzz e validar que retorna 404."
```
📌 Mostra o comportamento de falha controlada — ótima para testar status.

---

🔹 3. API com parâmetros — API do JSONPlaceholder
```
"Crie um teste para buscar o post com ID 1 em https://jsonplaceholder.typicode.com/posts/1 e validar se o título existe."
```
📌 API: https://jsonplaceholder.typicode.com/posts/1
🔎 Valida response.data.title.

---

🔹 4. POST de teste — JSONPlaceholder
```
"Crie um teste para enviar um POST para https://jsonplaceholder.typicode.com/posts com título e corpo e esperar status 201."
```
📝 API aceita POSTs fictícios e retorna uma resposta simulada — perfeito para demonstração.

---

🔹 5. Fluxo encadeado — POST + GET
```
"Crie um teste que envia um POST para https://jsonplaceholder.typicode.com/posts e em seguida verifica se consegue buscar o mesmo post com ID 101."
```
---

🔹 5. Teste de login e de autentificação — POST + GET
```
"Faça login via POST em https://reqres.in/api/login com email e senha, capture o token do response e use para fazer um GET autenticado em https://reqres.in/api/users?page=2 com status 200 ou 201. Dados:  email":eve.holt@reqres.in password:cityslicka"
```
---

🎯  O que aprendemos neste vídeo:

1. Como configurar um projeto Node.js com Docker e Prisma
2. Como usar a OpenAI para gerar testes automatizados com Jest
3. Como estruturar uma aplicação Express moderna
4. Como executar testes e gerar relatórios com Jest
5. Como salvar e gerenciar execuções em um banco PostgreSQL
6. Como executar, visualizar e repetir testes de forma prática

---

⚠️ Ponto de Atenção Importante

Antes de encerrar, um cuidado essencial:

Sempre evite utilizar dados reais, credenciais verdadeiras ou informações sensíveis ao testar com o TestFlow AI.

Essa ferramenta é voltada para testes automatizados e pode armazenar temporariamente as execuções.

Portanto, garanta que os dados utilizados sejam fictícios, descartáveis ou anonimizados.
Isso vale especialmente para APIs que exigem autenticação ou manipulam informações de usuários.

🔐 Segurança e privacidade devem ser prioridade em qualquer processo de teste.

