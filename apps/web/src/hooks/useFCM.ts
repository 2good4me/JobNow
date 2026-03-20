import { useEffect } from 'react';
import { messaging, db } from '@/config/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '@/features/auth/context/AuthContext';
import { toast } from 'sonner';

export const useFCM = () => {
  const { userProfile } = useAuth();
  
  useEffect(() => {
    if (!messaging || !userProfile?.uid) return;
    
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Register token
          const token = await getToken(messaging!);
          if (token) {
             const userRef = doc(db, 'users', userProfile.uid);
             await updateDoc(userRef, { fcmTokens: arrayUnion(token) });
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
  }, [userProfile?.uid]);
};
