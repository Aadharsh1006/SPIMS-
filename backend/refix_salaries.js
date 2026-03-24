const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('./models/Job');

async function ReFixSalaries() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Force all SDE jobs to 10 LPA as per user request
        const sdeUpdate = await Job.updateMany(
            { title: 'SDE' },
            { $set: { 'salaryRange.min': 10, 'salaryRange.max': 10 } }
        );
        console.log(`Updated ${sdeUpdate.modifiedCount} SDE jobs to 10 LPA`);

        const jobs = await Job.find({ title: 'SDE' }, 'title salaryRange');
        console.log('Verified SDE Salaries:', JSON.stringify(jobs, null, 2));

    } catch (err) {
        console.error('Error fixing salaries:', err);
    } finally {
        await mongoose.disconnect();
    }
}

ReFixSalaries();
