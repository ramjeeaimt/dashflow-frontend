import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAIiVAwMK3_npFhcIEFTPeFuchTjOQlNqw",
  authDomain: "dashflow-243f5.firebaseapp.com",
  projectId: "dashflow-243f5",
  storageBucket: "dashflow-243f5.firebasestorage.app",
  messagingSenderId: "873665968411",
  appId: "1:873665968411:web:8173eb27bb69de0f6f7bbe",
  measurementId: "G-6QLNB9SGWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export { app, db, messaging, getToken, onMessage };
export default app;
