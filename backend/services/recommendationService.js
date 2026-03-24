const { spawn } = require('child_process');
const path = require('path');

// Reusing the runAiCommand logic? 
// Ideally we should have a shared `aiService.js` or `pythonBridge.js`.
// But to follow the prompt's `recommendationService.js` structure:

const runAiCommand = (command, inputData) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
            path.join(__dirname, 'ai_engine', 'ai_engine.py'),
            command
        ]);


        let dataString = '';
        let errorString = '';

        const inputStr = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);

        pythonProcess.stdin.write(inputStr);
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${errorString}`));
            } else {
                try {
                    const jsonMatch = dataString.match(/\{.*\}/s);
                    if (!jsonMatch) throw new Error(`No JSON output found. Raw: ${dataString}`);
                    const result = JSON.parse(jsonMatch[0]);

                    if (result.error) {
                        reject(new Error(result.error));
                    } else {
                        resolve(result);
                    }
                } catch (err) {
                    reject(new Error(`Failed to parse Python output: ${dataString}`));
                }
            }
        });
    });
};

const getEmbedding = async (text) => {
    const result = await runAiCommand('embed_text', text);
    return result.embedding;
};

const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const matchAts = async (resumeText, jobDesc, jobSkills = []) => {
    return await runAiCommand('match_ats', {
        text: resumeText,
        job_desc: jobDesc,
        job_skills: jobSkills
    });
};

module.exports = { getEmbedding, cosineSimilarity, matchAts };
