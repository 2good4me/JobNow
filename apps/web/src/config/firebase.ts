import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

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
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-southeast1");
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export default app;

// Hỗ trợ lấy Token nhanh để Test Postman (Chỉ dùng trong quá trình phát triển)
if (typeof window !== 'undefined') {
    (window as any).getJobNowToken = async () => {
        if (!auth.currentUser) return "LỖI: Bạn chưa đăng nhập!";
        const token = await auth.currentUser.getIdToken();
        console.log("TOKEN CỦA BẠN:");
        console.log(token);
        return token;
    };
}
