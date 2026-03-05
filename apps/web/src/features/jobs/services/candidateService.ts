import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface CandidateProfile {
    uid: string;
    fullName: string;
    avatarUrl: string | null;
    phone: string;
    bio: string | null;
    addressText: string | null;
    skills: string[];
    reputationScore: number;
    identityImages: string[];
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
    balance: number;
    createdAt: Date;
}

/**
 * Fetch a single candidate profile by UID from Firestore `users` collection.
 */
export async function getCandidateProfile(uid: string): Promise<CandidateProfile | null> {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) return null;

    const d = snapshot.data();
    return {
        uid: snapshot.id,
        fullName: d.full_name || 'Ứng viên',
        avatarUrl: d.avatar_url || null,
        phone: d.phone_number || '',
        bio: d.bio || null,
        addressText: d.address_text || null,
        skills: d.skills || [],
        reputationScore: d.reputation_score ?? 100,
        identityImages: d.identity_images || [],
        verificationStatus: d.verification_status || 'UNVERIFIED',
        balance: d.balance ?? 0,
        createdAt: d.created_at?.toDate?.() ?? new Date(),
    };
}
