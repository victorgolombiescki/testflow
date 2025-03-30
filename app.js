const fs = require('fs');
const path = require('path');
const express = require('express');
const { generateTestFromPrompt } = require('./prompts/generateTestPrompt');
const { runTests } = require('./test-runner');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

const TEST_PATH = path.join(__dirname, 'tests');
const REPORTS_PATH = path.join(__dirname, 'reports');

// Funções auxiliares
function extractCodeBlock(text) {
    const codeRegex = /```(?:javascript)?\n([\s\S]*?)```/;
    const match = text.match(codeRegex);
    return match ? match[1].trim() : text.trim();
}

function formatJsonReport(report) {
    if (!report || !report.testResults || !Array.isArray(report.testResults[0]?.assertionResults)) {
        return {
            summary: '❌ Testes falharam e nenhum relatório foi gerado.',
            total: 0,
            failed: 0,
            passed: 0,
            details: []
        };
    }

    const assertions = report.testResults[0].assertionResults;
    const details = assertions.map((test, i) => ({
        id: i + 1,
        title: test.title,
        status: test.status,
        passed: test.status === 'passed'
    }));

    const passed = details.filter(t => t.passed).length;
    const failed = details.length - passed;

    return {
        summary: `✅ Total de testes: ${details.length}\n❌ Falhas: ${failed}`,
        total: details.length,
        failed,
        passed,
        details
    };
}

// Endpoint principal
app.post('/generate-and-run', async (req, res) => {
    const { instruction } = req.body;
    if (!instruction) return res.status(400).send({ error: 'Missing instruction' });

    const id = uuidv4();
    const testFileName = `generated-${id}.test.js`;
    const reportFileName = `test-report-${id}.json`;
    const testFilePath = path.join(TEST_PATH, testFileName);
    const reportFilePath = path.join(REPORTS_PATH, reportFileName);

    try {
        if (!fs.existsSync(TEST_PATH)) fs.mkdirSync(TEST_PATH);
        if (!fs.existsSync(REPORTS_PATH)) fs.mkdirSync(REPORTS_PATH);

        const rawTestCode = await generateTestFromPrompt(instruction);
        const testCode = extractCodeBlock(rawTestCode);

        fs.writeFileSync(testFilePath, testCode);

        const result = await runTests({ testFile: testFilePath, reportFile: reportFilePath });
        const formatted = formatJsonReport(result);

        // Salvar no banco
        await prisma.testExecution.create({
            data: {
                id,
                instruction,
                code: testCode,
                report: formatted,
                testFile: testFileName,
                reportFile: reportFileName
            }
        });

        res.send({
            success: true,
            report: formatted,
            download: `/download/${testFileName}`
        });

    } catch (err) {
        console.error('🔥 Erro ao gerar ou executar testes:', err);
        res.status(500).send({ error: 'Test generation or execution failed' });
    }
});

app.use('/download', express.static(TEST_PATH));

app.get('/executions', async (req, res) => {
    const executions = await prisma.testExecution.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json(executions);
});


app.delete('/executions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const execution = await prisma.testExecution.findUnique({ where: { id } });

        if (!execution) return res.status(404).json({ error: 'Execução não encontrada.' });

        const testPath = path.join(TEST_PATH, execution.testFile);
        const reportPath = path.join(REPORTS_PATH, execution.reportFile);
        if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
        if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);

        await prisma.testExecution.delete({ where: { id } });

        res.status(204).send();
    } catch (err) {
        console.error('Erro ao excluir execução:', err);
        res.status(500).json({ error: 'Erro interno ao excluir execução.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(3000, () => console.log('🚀 API Tester running on port 3000'));
