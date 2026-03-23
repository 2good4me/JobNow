import { useEffect } from 'react';
import { messaging, db } from '@/config/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/features/auth/context/AuthContext';
import { toast } from 'sonner';

export const useFCM = () => {
  const { userProfile } = useAuth();
  
  useEffect(() => {
    if (!messaging || !userProfile?.uid || userProfile.notification_push === false) return;
    
    const requestPermission = async () => {
      try {
        if (typeof window === 'undefined' || !('Notification' in window)) return;

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          const token = await getToken(messaging!, {
            serviceWorkerRegistration: registration,
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined,
          });
          if (token) {
             const userRef = doc(db, 'users', userProfile.uid);
             await updateDoc(userRef, {
              fcmTokens: arrayUnion(token),
              fcm_tokens: arrayUnion(token),
              updated_at: serverTimestamp(),
             });
             console.log('[FCM] Token registered successfully');
          }
        }
      } catch (e) {
        console.error('[FCM] Error getting token:', e);
      }
    };
    
    requestPermission();
    
    // Foreground message handler
    const unsubscribe = onMessage(messaging!, (payload) => {
      const title = payload.notification?.title || 'JobNow';
      const body = payload.notification?.body || 'Bạn có thông báo mới.';
      toast(title, { description: body, duration: 5000 });
    });
    
    return () => unsubscribe();
  }, [userProfile?.notification_push, userProfile?.uid]);
};
