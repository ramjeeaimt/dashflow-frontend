importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBh-iPDjfgl7_yan7nOZQK-6YOJNx22aiY",
  authDomain: "dash-flow-8a6dd.firebaseapp.com",
  projectId: "dash-flow-8a6dd",
  storageBucket: "dash-flow-8a6dd.firebasestorage.app",
  messagingSenderId: "1077355823086",
  appId: "1:1077355823086:web:8ac50a1e536e7b27f958ff",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Optional: customize background notification display here if needed
  // Note: If payload.notification is present, browser handles it automatically.
});
