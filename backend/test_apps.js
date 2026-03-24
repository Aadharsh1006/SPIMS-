const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Application = require('./models/Application');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Job = require('./models/Job');

mongoose.connect(process.env.MONGO_URI, {}).then(async () => {
    console.log("Connected");
    const applications = await Application.find().populate('studentId').populate('jobId');
    if (applications.length > 0) {
        for (let i = 0; i < Math.min(applications.length, 3); i++) {
            let app = applications[i];
            let user = await User.findById(app.studentId._id);
            let sp = await StudentProfile.findOne({ userId: app.studentId._id });
            console.log(`\nApp ID: ${app._id} | Job: ${app.jobId?.title}`);
            console.log(`App Match Score (layer1): ${app.aiScores?.layer1StudentMatch}`);
            console.log(`App ATS Score: ${app.aiScores?.atsScore}`);
            console.log(`User profile ATS: ${user?.profile?.atsScore}`);
            console.log(`User has SP? ${sp ? 'Yes' : 'No'}`);
        }
    } else {
        console.log("No applications found in DB.");
    }
    process.exit(0);
});
