// backend/resetAndSeed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const College = require('./models/College');
const Alumni = require('./models/Alumni');
const Application = require('./models/Application');
const AuditLog = require('./models/AuditLog');
const Broadcast = require('./models/Broadcast');
const CollegeConfig = require('./models/CollegeConfig');
const Job = require('./models/Job');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const Resume = require('./models/Resume');
const StudentProfile = require('./models/StudentProfile');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    try {
        console.log('Cleaning all collections...'.yellow);

        const models = [
            User, College, Alumni, Application, AuditLog,
            Broadcast, CollegeConfig, Job, Message,
            Notification, Resume, StudentProfile
        ];

        for (const model of models) {
            await model.deleteMany({});
            console.log(`Cleared ${model.modelName}`.gray);
        }

        console.log('Database emptied successfully.'.red.bold);

        console.log('Creating sample SuperAdmin...'.blue);

        await User.create({
            name: 'System SuperAdmin',
            email: 'superadmin@example.com',
            password: 'password123',
            role: 'SUPER_ADMIN',
            collegeId: null,
            isActive: true
        });

        console.log('SuperAdmin created: superadmin@example.com / password123'.green.bold);
        console.log('Reset and Seeding complete!'.green.inverse);

        process.exit(0);
    } catch (error) {
        console.error(`Seeding failed: ${error.message}`.red.bold);
        process.exit(1);
    }
};

run();
