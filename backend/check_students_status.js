const mongoose = require('mongoose');
require('dotenv').config();

const checkStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const students = await User.find({ role: 'STUDENT', collegeId: 'SKCET' });
        console.log("Total Students found in SKCET:", students.length);
        students.forEach(s => {
            console.log(`- Student: ${s.name}, Email: ${s.email}, isActive: ${s.isActive}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStudents();
