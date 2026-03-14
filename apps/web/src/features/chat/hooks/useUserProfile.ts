import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface UserProfile {
    uid: string;
    fullName: string;
    avatarUrl: string | null;
    role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
}

async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snapshot = await getDoc(doc(db, 'users', uid));
    if (!snapshot.exists()) return null;

    const d = snapshot.data();
    return {
        uid,
        fullName: String(d.full_name ?? d.fullName ?? ''),
        avatarUrl: String(d.avatar_url ?? d.avatarUrl ?? ''),
        role: d.role as UserProfile['role'],
    };
}

export function useUserProfile(uid: string | undefined) {
    return useQuery<UserProfile | null>({
        queryKey: ['user-profile', uid],
        queryFn: () => getUserProfile(uid!),
        enabled: !!uid,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
