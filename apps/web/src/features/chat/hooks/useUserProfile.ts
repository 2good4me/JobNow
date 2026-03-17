import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface UserProfile {
    uid: string;
    fullName: string;
    avatarUrl: string | null;
    role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
    last_active_at?: any;
}

async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snapshot = await getDoc(doc(db, 'users', uid));
    if (!snapshot.exists()) return null;

    const d = snapshot.data();
    return {
        uid,
        fullName: String(d.full_name ?? d.fullName ?? ''),
        avatarUrl: String(d.avatar_url ?? d.avatarUrl ?? d.company_logo_url ?? ''),
        role: d.role as UserProfile['role'],
        last_active_at: d.last_active_at,
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
