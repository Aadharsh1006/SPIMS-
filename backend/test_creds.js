const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const testCreds = [
    { email: 'superadmin@example.com', password: 'password123' },
    { email: 'faculty1@skcet.ac.in', password: 'password123' },
    { email: 'tpo@skcet.ac.in', password: 'password123' }
];

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        for (const cred of testCreds) {
            const user = await User.findOne({ email: cred.email }).select('+password');
            if (!user) {
                console.log(`[FAIL] User not found: ${cred.email}`);
                continue;
            }
            if (!user.password) {
                console.log(`[FAIL] User has no password set: ${cred.email}`);
                continue;
            }
            const isMatch = await bcrypt.compare(cred.password, user.password);
            console.log(`[${isMatch ? 'PASS' : 'FAIL'}] ${cred.email} | Hash: ${user.password.substring(0, 10)}... | Match: ${isMatch}`);
        }
    } catch (err) {
        console.error('Test Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
