import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAzbJ2ftaStDpXL1LgfHZKMD2LEhNhPpuo",
    authDomain: "jobnow-80037.firebaseapp.com",
    projectId: "jobnow-80037",
    storageBucket: "jobnow-80037.firebasestorage.app",
    messagingSenderId: "166587026075",
    appId: "1:166587026075:web:a7e0995bdcc23d16be543e",
    measurementId: "G-W6EYZKBPQY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
