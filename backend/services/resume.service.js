// backend/services/resume.service.js
const axios = require('axios');
const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

const mongoose = require('mongoose');

const parseWithSpacy = async (text) => {
    try {
        const res = await axios.post((process.env.SPACY_SERVICE_URL || 'http://127.0.0.1:8000') + '/parse', { text });
        return res.data;
    } catch (err) {
        console.error('spaCy service error:', err.message);
        return null;
    }
};

const saveResume = async (studentId, collegeId, rawText) => {
    try {
        const parsed = await parseWithSpacy(rawText);
        const version = await Resume.countDocuments({ studentId }) + 1;

        const sId = new mongoose.Types.ObjectId(studentId);

        // 1. Create and Save Resume Record
        const resume = new Resume({
            collegeId,
            studentId: sId,
            version,
            rawText,
            parsed: parsed || {},
            atsScore: parsed?.atsScore || 0,
            atsBreakdown: parsed?.atsBreakdown || {},
            extractionMethod: parsed?.extractionMethod || 'Unknown'
        });
        await resume.save();

        // 2. Synchronize with StudentProfile & User
        if (parsed) {
            const existingProfile = await StudentProfile.findOne({ userId: sId });

            // Deduplicate projects: we want to CLEAR out old AI-extracted projects and ONLY keep the new ones.
            // However, we will preserve any manual projects that the AI somehow completely missed.
            const existingProjects = existingProfile?.projects || [];
            const newProjects = parsed.projects || [];

            const normalize = (str) => String(str || '')
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .replace(/(project|system|application|app|website|web|using|with|base|extraction|engine)/g, '')
                .trim();

            const mergedProjects = [...newProjects];
            const seenNormalizedTitles = new Set(newProjects.map(p => normalize(p.title)));

            existingProjects.forEach(ep => {
                const epNorm = normalize(ep.title);
                // Only keep old projects if they were likely manually added (have no AI audit data)
                // and the AI didn't find a new version of them.
                if (epNorm && !seenNormalizedTitles.has(epNorm) && !ep.aiAudit?.isVerified) {
                    mergedProjects.push(ep);
                    seenNormalizedTitles.add(epNorm);
                }
            });

            const updateData = {
                parsedSkills: parsed.skills || [],
                experience: parsed.experience || [],
                education: parsed.education || [],
                projects: mergedProjects,
                achievements: parsed.achievements || [],
                certifications: parsed.certifications || [],
                softSkills: parsed.softSkills || [],
                atsScore: parsed.atsScore || 0,
                atsBreakdown: parsed.atsBreakdown || {},
                profileStrength: parsed.profileStrength || 0,
                scoreReasoning: Array.isArray(parsed.scoreReasoning) 
                    ? parsed.scoreReasoning.join('\n') 
                    : (parsed.scoreReasoning || ''),
                recruiterPitch: parsed.recruiterPitch || '',
                careerPaths: parsed.careerPaths || []
            };

            // Only overwrite if AI actually found something
            if (parsed.bio && parsed.bio.trim().length > 10) updateData.bio = parsed.bio;
            if (parsed.linkedinUrl) updateData.linkedinUrl = parsed.linkedinUrl;
            if (parsed.githubUrl) updateData.githubUrl = parsed.githubUrl;

            await StudentProfile.findOneAndUpdate(
                { userId: sId },
                { $set: updateData },
                { upsert: true, returnDocument: 'after' }
            );

            const rawCgpa = parsed.education?.[0]?.grade;
            const cgpa = (rawCgpa && !isNaN(parseFloat(rawCgpa))) ? parseFloat(rawCgpa) : undefined;

            const userUpdateData = {
                'profile.skills': Array.from(new Set([...(existingProfile?.skills || []), ...(parsed.skills || [])])).sort(),
                'profile.cgpa': cgpa,
                'profile.experience': parsed.experience || [],
                'profile.education': parsed.education || [],
                'profile.projects': mergedProjects,
                'profile.achievements': Array.from(new Set([...(existingProfile?.achievements || []), ...(parsed.achievements || [])])).sort(),
                'profile.certifications': Array.from(new Set([...(existingProfile?.certifications || []), ...(parsed.certifications || [])])).sort(),
                'profile.softSkills': parsed.softSkills || [],
                'profile.atsScore': parsed.atsScore || 0,
                'profile.atsBreakdown': parsed.atsBreakdown || {},
                'profile.profileStrength': parsed.profileStrength || 0,
                'profile.scoreReasoning': Array.isArray(parsed.scoreReasoning) 
                    ? parsed.scoreReasoning.join('\n') 
                    : (parsed.scoreReasoning || ''),
                'profile.recruiterPitch': parsed.recruiterPitch || '',
                'profile.careerPaths': parsed.careerPaths || []
            };

            if (updateData.bio) userUpdateData['profile.bio'] = updateData.bio;
            if (parsed.linkedinUrl) userUpdateData['profile.linkedinUrl'] = parsed.linkedinUrl;
            if (parsed.githubUrl) userUpdateData['profile.githubUrl'] = parsed.githubUrl;

            await User.findByIdAndUpdate(sId, { $set: userUpdateData });
        }

        return resume;
    } catch (err) {
        console.error('Service: saveResume Error:', err);
        throw err;
    }
};

module.exports = { parseWithSpacy, saveResume };
