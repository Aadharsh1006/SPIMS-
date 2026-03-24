// frontend/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "spims-c4d3d",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app, messaging;

try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
} catch (error) {
    console.warn("Firebase initialization failed. Check config.", error);
}

export const requestFirebaseNotificationPermission = async () => {
    try {
        if (!messaging) return null;
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Explicitly register the service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/firebase-cloud-messaging-push-scope',
            });
            console.log('Service Worker Registered');

            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "",
                serviceWorkerRegistration: registration
            });
            return token;
        } else {
            console.log('Notification permission denied.');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
        return null;
    }
};

export const onMessageListener = (callback) => {
    if (!messaging) return;
    return onMessage(messaging, (payload) => {
        callback(payload);
    });
};
