const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User'); // Adjust path if needed
const College = require('./models/College');

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

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await User.deleteMany();
        await College.deleteMany();
        console.log('Data Cleared!'.red.inverse);

        // Check if college exists
        let college = await College.findOne({ name: 'Demo Engineering College' });
        if (!college) {
            college = await College.create({
                name: 'Demo Engineering College',
                address: '123 Tech Park',
                contactEmail: 'admin@demo.edu',
                collegeId: 'DEC001',
                domain: 'demo.edu',
                // subscriptionStatus: 'Active', // Not in schema, might error if strict
            });
            console.log('College Created'.green);
        }

        const users = [
            {
                name: 'Super Admin',
                email: 'superadmin@example.com',
                password: 'password123',
                role: 'SUPER_ADMIN',
                collegeId: college._id
            },
            {
                name: 'TPO Officer',
                email: 'tpo@example.com',
                password: 'password123',
                role: 'TPO',
                collegeId: college._id,
                isApproved: true
            },
            {
                name: 'Faculty Member',
                email: 'faculty@example.com',
                password: 'password123',
                role: 'FACULTY',
                collegeId: college._id,
                isApproved: true
            },
            {
                name: 'Student User',
                email: 'student@example.com',
                password: 'password123',
                role: 'STUDENT',
                collegeId: college._id,
                isApproved: true
            },
            {
                name: 'Recruiter User',
                email: 'recruiter@example.com',
                password: 'password123',
                role: 'RECRUITER',
                collegeId: college._id,
                isApproved: true
            }
        ];

        for (const user of users) {
            const userExists = await User.findOne({ email: user.email });
            if (!userExists) {
                await User.create(user);
                console.log(`Created user: ${user.name} (${user.role})`.green);
            } else {
                console.log(`User already exists: ${user.name}`.yellow);
            }
        }

        console.log('Data Imported!'.green.inverse);
        console.log('Default Password for all users: password123'.cyan);
        process.exit();

    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

seedData();
