const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

let messaging;

try {
    if (serviceAccount && serviceAccount.project_id) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        messaging = admin.messaging();
        console.log('Firebase Admin Initialized'.green.bold);
    } else {
        console.log('Firebase Service Account invalid, skipping FCM init'.yellow);
    }
} catch (error) {
    console.error('Firebase Init Error:'.red, error.message);
}

const sendPushNotification = async (token, title, body, data = {}) => {
    if (!messaging) return;

    try {
        await messaging.send({
            token,
            notification: { title, body },
            data
        });
    } catch (error) {
        console.error('FCM Send Error:', error);
    }
};

module.exports = { sendPushNotification };
