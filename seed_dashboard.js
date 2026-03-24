const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const User = require('./backend/models/User');
const Job = require('./backend/models/Job');
const Application = require('./backend/models/Application');

const seedDash = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const students = await User.find({ role: 'STUDENT' }).limit(3);
        const faculty = await User.findOne({ role: 'FACULTY' });
        const job = await Job.findOne({ status: 'PUBLISHED' });

        if (!students.length || !faculty || !job) {
            console.log('Missing required data to seed placements (students, faculty or job).');
            process.exit(0);
        }

        console.log(`Found ${students.length} students, 1 faculty, 1 job. Seeding placements...`);

        // Delete existing applications for these students to avoid clutter
        await Application.deleteMany({ studentId: { $in: students.map(s => s._id) } });

        const statuses = ['OFFER_ACCEPTED', 'OFFERED', 'RECRUITER_SHORTLISTED'];

        for (let i = 0; i < students.length; i++) {
            await Application.create({
                studentId: students[i]._id,
                jobId: job._id,
                facultyId: faculty._id,
                collegeId: students[i].collegeId,
                status: statuses[i] || 'OFFER_ACCEPTED',
                appliedAt: new Date(Date.now() - (i * 86400000)),
                encryptedPayload: 'dummy',
                iv: 'dummy',
                authTag: 'dummy'
            });
        }

        console.log('Successfully seeded 3 placements for the dashboard!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDash();
