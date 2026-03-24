const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const jobService = require('./services/job.service');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {}).then(async () => {
    console.log("Connected");
    const testStudent = await User.findOne({ role: 'STUDENT' });
    const Job = require('./models/Job');
    const Resume = require('./models/Resume');
    const { computeStudentJobMatch } = require('./services/aiMatching.service');

    const jobs = await Job.find();
    if (jobs.length === 0) return console.log("no jobs");
    const resume = await Resume.findOne({ studentId: testStudent._id }).sort({ version: -1 });

    for (let i = 0; i < Math.min(jobs.length, 3); i++) {
        const match = await computeStudentJobMatch(testStudent, resume, jobs[i]);
        console.log(`\nJob: ${jobs[i].title}`);
        console.log(`Match Score: ${match.matchPercentage}`);
        console.log(`Explanation: ${match.explanation}`);
    }
    process.exit(0);
});
