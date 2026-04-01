import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { getUserDocument } from '@/lib/firestore';
import type { UserProfile, UserRole } from '@/features/auth/types/user';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    role: UserRole | null;
    loading: boolean;
    /** True when Firebase Auth user exists but no Firestore profile yet */
    needsProfileSetup: boolean;
    signOut: () => Promise<void>;
    /** Re-fetch the Firestore profile (call after onboarding completes) */
    refreshProfile: (firebaseUserOverride?: User) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (firebaseUser: User): Promise<UserProfile | null> => {
        try {
            const profile = await getUserDocument(firebaseUser.uid);
            setUserProfile(profile);
            return profile;
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setUserProfile(null);
            return null;
        }
    }, []);

    useEffect(() => {
        // Support Playwright E2E Mocking
        if (typeof window !== 'undefined' && (window as any).__JOBNOW_E2E_MOCK_AUTH__) {
            const mock = (window as any).__JOBNOW_E2E_MOCK_AUTH__;
            setUser({ 
                uid: mock.profile.uid, 
                email: mock.profile.email,
                displayName: mock.profile.full_name,
                getIdToken: async () => 'mock-token',
            } as any);
            setUserProfile(mock.profile);
            setLoading(false);
            return;
        }

        let isMounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!isMounted) return;

            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser);
            } else if (isMounted) {
                setUserProfile(null);
            }

            if (isMounted) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [fetchProfile]);

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUserProfile(null);
    };

    const refreshProfile = useCallback(async (firebaseUserOverride?: User) => {
        const targetUser = firebaseUserOverride ?? user;
        if (targetUser) {
            return await fetchProfile(targetUser);
        }
        return null;
    }, [user, fetchProfile]);

    const role = userProfile?.role ?? null;
    const needsProfileSetup = !!user && !userProfile;

    return (
        <AuthContext.Provider
            value={{ user, userProfile, role, loading, needsProfileSetup, signOut, refreshProfile }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
