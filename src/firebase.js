import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBh-iPDjfgl7_yan7nOZQK-6YOJNx22aiY",
  authDomain: "dash-flow-8a6dd.firebaseapp.com",
  projectId: "dash-flow-8a6dd",
  storageBucket: "dash-flow-8a6dd.firebasestorage.app",
  messagingSenderId: "1077355823086",
  appId: "1:1077355823086:web:8ac50a1e536e7b27f958ff",
  measurementId: "G-95QVXFSSVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

const VAPID_KEY = 'BBhfsFp4bKk3d1y2KXFisjsW6Cq_y96r4BtqjAESkOPFVOQWUADZ0-8OIXbimToM-XuGVE4hC6r44jE3vNyp2u0';

export { app, db, messaging, getToken, onMessage, VAPID_KEY };
export default app;
