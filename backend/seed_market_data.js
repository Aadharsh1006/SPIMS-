const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');
require('dotenv').config();

async function seedJobs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected for seeding...');

        // Find a collegeId and TPO/Recruiter to assign jobs to
        const tpo = await User.findOne({ role: 'TPO' });
        if (!tpo) {
            console.log('No TPO found, aborting seed.');
            process.exit(1);
        }

        const sampleJobs = [
            {
                title: 'Full Stack Engineer',
                company: 'TechCorp',
                description: 'Build modern web apps with MERN stack.',
                requirements: {
                    skillsRequired: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
                    experience: '0-2 years'
                },
                location: 'Remote',
                jobType: 'FULL_TIME',
                salaryRange: { min: 800000, max: 1200000 },
                status: 'PUBLISHED',
                collegeId: tpo.collegeId,
                postedBy: tpo._id
            },
            {
                title: 'Data Scientist',
                company: 'DataFlow',
                description: 'Analyze data and build ML models.',
                requirements: {
                    skillsRequired: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'NumPy'],
                    experience: 'Entry Level'
                },
                location: 'Bangalore',
                jobType: 'INTERNSHIP',
                salaryRange: { min: 20000, max: 40000 },
                status: 'PUBLISHED',
                collegeId: tpo.collegeId,
                postedBy: tpo._id
            },
            {
                title: 'DevOps Engineer',
                company: 'CloudNative',
                description: 'Manage cloud infrastructure and CI/CD.',
                requirements: {
                    skillsRequired: ['Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD'],
                    experience: '1+ year'
                },
                location: 'Hyderabad',
                jobType: 'FULL_TIME',
                salaryRange: { min: 1000000, max: 1500000 },
                status: 'PUBLISHED',
                collegeId: tpo.collegeId,
                postedBy: tpo._id
            }
        ];

        await Job.insertMany(sampleJobs);
        console.log('Sample jobs seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedJobs();
