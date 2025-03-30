const { exec } = require('child_process');
const fs = require('fs');

function runTests({ testFile, reportFile }) {
    return new Promise((resolve) => {
        exec(`npx jest ${testFile} --json --outputFile=${reportFile}`, (error, stdout, stderr) => {
            if (fs.existsSync(reportFile)) {
                try {
                    const json = fs.readFileSync(reportFile, 'utf-8');
                    return resolve(JSON.parse(json));
                } catch (e) {
                    console.warn('⚠️ Erro ao interpretar o JSON do relatório:', e.message);
                }
            }
            return resolve({
                testResults: [],
                numTotalTests: 0,
                numFailedTests: 0,
                numPassedTests: 0
            });
        });
    });
}

module.exports = { runTests };
