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
    needsOnboarding: boolean;
    signOut: () => Promise<void>;
    /** Re-fetch the Firestore profile (call after onboarding completes) */
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (firebaseUser: User) => {
        try {
            const profile = await getUserDocument(firebaseUser.uid);
            setUserProfile(profile);
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setUserProfile(null);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await fetchProfile(currentUser);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [fetchProfile]);

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUserProfile(null);
    };

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user);
        }
    }, [user, fetchProfile]);

    const role = userProfile?.role ?? null;
    const needsOnboarding = !!user && !userProfile;

    return (
        <AuthContext.Provider
            value={{ user, userProfile, role, loading, needsOnboarding, signOut, refreshProfile }}
        >
            {!loading && children}
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
