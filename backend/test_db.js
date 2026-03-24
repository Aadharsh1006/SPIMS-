const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');

mongoose.connect(process.env.MONGO_URI, {}).then(async () => {
    console.log("Connected");
    const user = await User.findOne({ email: 'aadhavr2025@srcas.ac.in' });
    // assuming email or just find one student
    if (!user) {
        const anyStudent = await User.findOne({ role: 'STUDENT' });
        console.log("Found student:", anyStudent.email, anyStudent._id);
        const profile = await StudentProfile.findOne({ userId: anyStudent._id });
        console.log("Student Profile skills:", profile?.parsedSkills);
        console.log("User profile skills:", anyStudent.profile?.skills);
    } else {
        console.log("Found user:", user._id);
        const profile = await StudentProfile.findOne({ userId: user._id });
        console.log("Student Profile skills:", profile?.parsedSkills);
        console.log("User profile skills:", user.profile?.skills);
    }
    process.exit(0);
});
