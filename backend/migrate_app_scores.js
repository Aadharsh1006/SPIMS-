const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Application = require('./models/Application');
const User = require('./models/User');
const Resume = require('./models/Resume');
const Job = require('./models/Job');
const { computeStudentJobMatch } = require('./services/aiMatching.service');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Database. Starting migration...");

        const applications = await Application.find();
        let count = 0;

        for (const app of applications) {
            const studentUser = await User.findById(app.studentId);
            const job = await Job.findById(app.jobId);
            const resume = await Resume.findById(app.resumeId);

            if (studentUser && job) {
                // Re-run the Phase 29 fixed algorithm
                const match = await computeStudentJobMatch(studentUser, resume, job);

                // Keep the newly dynamic atsScore intact if it was updated, just fix layer1 and the explanation
                app.aiScores.layer1StudentMatch = match.matchPercentage;
                app.aiScores.aiExplanation = match.explanation;

                // For applications where the ATS score strictly matches the layer 1 score (the bug patched in Phase 31)
                // We should also patch their historical ATS score to pull from their profile
                if (studentUser.profile && studentUser.profile.atsScore) {
                    app.aiScores.atsScore = studentUser.profile.atsScore;
                }

                await app.save();
                count++;
                console.log(`Updated App ${app._id} | New Match: ${match.matchPercentage}% | ATS: ${app.aiScores.atsScore}`);
            }
        }

        console.log(`\nMigration completed successfully. Repaired ${count} existing application scores.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
