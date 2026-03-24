const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./backend/models/User');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'master@gmail.com' });
    console.log('Alumni User:', JSON.stringify(user, null, 2));
    process.exit(0);
}
check();
