importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAzbJ2ftaStDpXL1LgfHZKMD2LEhNhPpuo",
    authDomain: "jobnow-80037.firebaseapp.com",
    projectId: "jobnow-80037",
    storageBucket: "jobnow-80037.firebasestorage.app",
    messagingSenderId: "166587026075",
    appId: "1:166587026075:web:a7e0995bdcc23d16be543e",
    measurementId: "G-W6EYZKBPQY"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Thông báo mới JobNow';
  const notificationOptions = {
    body: payload.notification?.body || 'Bạn có một tương tác mới.',
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
