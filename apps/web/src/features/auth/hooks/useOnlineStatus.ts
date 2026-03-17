import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserActiveStatus } from '../services/authService';

/**
 * Hook to automatically update user's online status (heartbeat)
 * Runs periodically when the user is authenticated and navigating the app
 */
export function useOnlineStatus() {
    const { userProfile } = useAuth();

    useEffect(() => {
        if (!userProfile?.uid) return;

        // Initial update
        updateUserActiveStatus(userProfile.uid);

        // Periodically update every 2 minutes
        const interval = setInterval(() => {
            updateUserActiveStatus(userProfile.uid);
        }, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, [userProfile?.uid]);
}
