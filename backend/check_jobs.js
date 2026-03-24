const mongoose = require('mongoose');
require('dotenv').config();

const checkJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Job = require('./models/Job');
        const jobs = await Job.find({});
        console.log("Total Jobs found:", jobs.length);
        jobs.forEach(j => {
            console.log("-------------------");
            console.log(`Title: ${j.title}`);
            console.log(`Company: ${j.company}`);
            console.log(`Status: ${j.status}`);
            console.log(`CollegeId: ${j.collegeId}`);
            console.log(`Access: ${JSON.stringify(j.accessByColleges, null, 2)}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkJobs();
