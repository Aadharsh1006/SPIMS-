const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const Notification = require('../backend/models/Notification');

async function checkNotifications() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const notifs = await Notification.find().limit(5).sort({ createdAt: -1 });
        console.log('Recent Notifications:', JSON.stringify(notifs, null, 2));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkNotifications();
