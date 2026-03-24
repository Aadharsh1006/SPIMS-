// backend/services/aiMatching.service.js
const natural = require('natural');
const { cosineSimilarity } = require('../utils/similarity.utils');

const tokenizer = new natural.WordTokenizer();

const computeTfIdfVector = (docs) => {
    const tfidf = new natural.TfIdf();
    docs.forEach(d => tfidf.addDocument(d));
    return tfidf;
};

const buildVector = (tfidf, docIndex) => {
    const vector = [];
    tfidf.listTerms(docIndex).forEach(item => {
        vector.push(item.tfidf);
    });
    return vector;
};

const computeMatchScore = (resumeText, jobText) => {
    const docs = [resumeText, jobText];
    const tfidf = computeTfIdfVector(docs);
    const v1 = buildVector(tfidf, 0);
    const v2 = buildVector(tfidf, 1);
    return cosineSimilarity(v1, v2); // 0..1
};

const computeStudentJobMatch = async (student, resume, job) => {
    // 1. Semantic Similarity (Requires Resume or Bio)
    const resumeText = resume?.rawText || student?.profile?.bio || '';
    const semanticScore = resumeText ? computeMatchScore(resumeText, job.description || '') : 0.2; 

    // 2. Skill Overlap (Combine Profile and Resume skills)
    let studentSkills = [];
    if (student && student.profile && student.profile.skills) {
        studentSkills = [...studentSkills, ...student.profile.skills];
    }
    if (resume && resume.parsed && resume.parsed.skills) {
        studentSkills = [...studentSkills, ...resume.parsed.skills];
    }

    // Fetch AI Parsed Skills from StudentProfile collection natively 
    const studentId = student?._id || student?.userId;
    if (studentId) {
        try {
            const StudentProfile = require('../models/StudentProfile');
            const aiProfile = await StudentProfile.findOne({ userId: studentId });
            if (aiProfile) {
                if (aiProfile.parsedSkills) studentSkills = [...studentSkills, ...aiProfile.parsedSkills];
                if (aiProfile.softSkills) studentSkills = [...studentSkills, ...aiProfile.softSkills];
            }
        } catch (error) {
            console.error('Failed to fetch AI StudentProfile for Match Calculation:', error);
        }
    }

    // Deduplicate skills
    studentSkills = [...new Set(studentSkills.map(s => s.toLowerCase().trim()))];

    const jobSkills = (job.requirements && job.requirements.skillsRequired) || [];

    // Loose match to catch cases like 'react' vs 'react.js'
    const overlap = studentSkills.filter(s =>
        jobSkills.some(js => {
            const jLower = js.toLowerCase().trim();
            return jLower.includes(s) || s.includes(jLower);
        })
    );

    const skillScore = jobSkills.length > 0 ? overlap.length / jobSkills.length : 0.5;

    // 3. Overall match (weighted 60/40)
    const matchPercentage = Math.round(((semanticScore * 0.4) + (skillScore * 0.6)) * 100);

    // 4. Explanation
    let explanation = `Semantic match: ${Math.round(semanticScore * 100)}%. `;
    if (overlap.length > 0) {
        explanation += `Matched skills: ${overlap.join(', ')}. `;
    }

    if (student && student.profile && job.requirements) {
        if (job.requirements.minCgpa && student.profile.cgpa >= job.requirements.minCgpa) {
            explanation += `CGPA meets requirement. `;
        }
    }

    return {
        matchPercentage,
        explanation
    };
};

module.exports = { computeMatchScore, computeStudentJobMatch };

