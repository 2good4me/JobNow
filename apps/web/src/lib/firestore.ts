import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { UserProfile, UserRole } from '@/features/auth/types/user';

/**
 * Create a new user document in Firestore `users` collection.
 * Called after Firebase Auth account creation.
 */
export async function createUserDocument(
    uid: string,
    data: {
        email: string;
        full_name: string;
        role: UserRole;
        phone_number?: string;
        avatar_url?: string | null;
    }
): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        phone_number: data.phone_number || '',
        avatar_url: data.avatar_url || null,
        bio: null,
        address_text: null,
        status: 'ACTIVE',
        balance: 0,
        reputation_score: 100,
        skills: [],
        identity_images: [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    });
}

/**
 * Fetch user profile from Firestore.
 * Returns null if document doesn't exist (e.g. Google sign-in without onboarding).
 */
export async function getUserDocument(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
        uid: snapshot.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        phone_number: data.phone_number || '',
        avatar_url: data.avatar_url || null,
        bio: data.bio || null,
        address_text: data.address_text || null,
        status: data.status,
        balance: data.balance ?? 0,
        reputation_score: data.reputation_score ?? 100,
        skills: data.skills || [],
        identity_images: data.identity_images || [],
        created_at: data.created_at?.toDate?.() ?? new Date(),
        updated_at: data.updated_at?.toDate?.() ?? new Date(),
    } as UserProfile;
}

/**
 * Update specific fields on a user document.
 */
export async function updateUserDocument(
    uid: string,
    data: Partial<Omit<UserProfile, 'uid' | 'created_at'>>
): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        ...data,
        updated_at: serverTimestamp(),
    });
}
