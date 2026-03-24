importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// "Default" Firebase configuration (can be empty but must exist to initialize).
// In a real production build, these should be replaced with actual Firebase config values.
// VITE env variables are not automatically injected here without a bundler plugin.
const firebaseConfig = {
    apiKey: "AIzaSyDfdCEjcrp2LL85bNoYfFcCPXVTbTohap8",
    authDomain: "spims-c4d3d.firebaseapp.com",
    projectId: "spims-c4d3d",
    storageBucket: "spims-c4d3d.firebasestorage.app",
    messagingSenderId: "890153140204",
    appId: "1:890153140204:web:eb5f8eca69b66cbd774ac9"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification?.title || payload.data?.title || 'SPIMS+ Notification';
        const notificationOptions = {
            body: payload.notification?.body || payload.data?.body || 'You have a new message.',
            icon: '/vite.svg'
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (error) {
    console.warn("Failed to initialize Firebase in service worker.", error);
}
