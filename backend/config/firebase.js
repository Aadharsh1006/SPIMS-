const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

if (!serviceAccount) {
    const filePath = path.join(__dirname, 'firebase-service-account.json');
    if (fs.existsSync(filePath)) {
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
}

if (serviceAccount) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} else {
    console.warn('Firebase Service Account not found. FCM will not work.');
}

const sendPushNotification = async (tokens, title, body, data = {}) => {
    if (!admin.apps.length || !tokens.length) return;
    const message = {
        notification: { title, body },
        tokens,
        data
    };
    try {
        const response = await admin.messaging().sendMulticast(message);
        console.log('FCM Success:', response.successCount);
        return response;
    } catch (error) {
        console.error('FCM Error:', error);
    }
};

module.exports = { admin, sendPushNotification };
