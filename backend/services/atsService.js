const { spawn } = require('child_process');
const path = require('path');

const runAiCommand = (command, inputData) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
            path.join(__dirname, 'ai_engine', 'ai_engine.py'),
            command
        ]);


        let dataString = '';
        let errorString = '';

        // Determine if inputData is string or object
        const inputStr = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);

        // Write to stdin
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
                    // Find the last valid JSON in the output (in case of warnings)
                    const jsonMatch = dataString.match(/\{.*\}/s);
                    if (!jsonMatch) {
                        // Fallback if no JSON found
                        throw new Error(`No JSON output found. Raw: ${dataString}`);
                    }
                    // Try to parse the last line or the matched JSON
                    // Python script prints strictly one JSON line usually, but lets be safe
                    const result = JSON.parse(jsonMatch[0]);

                    if (result.error) {
                        reject(new Error(result.error));
                    } else {
                        resolve(result);
                    }
                } catch (err) {
                    reject(new Error(`Failed to parse Python output: ${dataString}. Error: ${err.message}`));
                }
            }
        });
    });
};

const matchResumeToJob = async (resumeText, jobDescription, jobSkills = []) => {
    try {
        const input = {
            command: 'match_ats',
            text: resumeText,
            job_desc: jobDescription,
            job_skills: jobSkills
        };
        const output = await runAiCommand(input);

        // Output format check
        if (output && output.score !== undefined) {
            return output; // Returns { score, explanation }
        }
        return { score: 0, explanation: null };
    } catch (error) {
        console.error('ATS Match Error:', error);
        return { score: 0, explanation: null };
    }
};

const calculateAtsScore = async (resumeText, jobDescription) => {
    const result = await runAiCommand('match_ats', {
        resume_text: resumeText,
        job_description: jobDescription
    });
    return result.ats_score;
};

const parseResume = async (filePath) => {
    // This command in ai_engine.py takes file path as arg in original code, 
    // but we updated it to read from stdin OR arg. 
    // To keep it simple, let's pass file path as arg if we revert to that, 
    // OR just pass the content?
    // The original `parse_resume` in ai_engine.py uses `extract_text(file_path)`.
    // So we must pass the path.
    // My updated ai_engine.py: 
    // if command == "parse_resume":
    //     print(json.dumps(parse_resume(input_data)))
    // And input_data is sys.argv[2] (path) OR stdin.
    // If we pass path via stdin, it works.

    const result = await runAiCommand('parse_resume', filePath);
    return result;
};

module.exports = { calculateAtsScore, parseResume };
