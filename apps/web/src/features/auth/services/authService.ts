import { doc, getDoc, setDoc, serverTimestamp, collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface UserProfile {
    uid: string;
    fullName: string;
    avatarUrl: string | null;
    role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
    company_name?: string;
    last_active_at?: any;
}

/**
 * Fetch a basic user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const snapshot = await getDoc(doc(db, 'users', uid));
        if (!snapshot.exists()) return null;

        const d = snapshot.data();
        return {
            uid,
            fullName: String(d.full_name ?? d.fullName ?? ''),
            avatarUrl: String(d.avatar_url ?? d.avatarUrl ?? d.company_logo_url ?? ''),
            role: d.role as UserProfile['role'],
            company_name: d.company_name,
            last_active_at: d.last_active_at
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Update current user's last active timestamp
 */
export async function updateUserActiveStatus(uid: string) {
    try {
        await setDoc(doc(db, 'users', uid), {
            last_active_at: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error('Error updating active status:', error);
    }
}

/**
 * MOCK FULL TEXT SEARCH FOR USERS
 * Searches by fullName or email (In-memory filter for small scale demo)
 */
export async function searchGlobalUsers(keyword: string): Promise<UserProfile[]> {
    if (!keyword.trim()) return [];
    const lower = keyword.toLowerCase();
    
    try {
        const q = query(collection(db, 'users'), limit(500));
        const snapshot = await getDocs(q);
        
        const results: UserProfile[] = [];
        for (const userDoc of snapshot.docs) {
            const data = userDoc.data();
            const fullName = String(data.full_name ?? data.fullName ?? '').toLowerCase();
            const email = String(data.email ?? '').toLowerCase();
            
            if (fullName.includes(lower) || email.includes(lower)) {
                results.push({
                    uid: userDoc.id,
                    fullName: String(data.full_name ?? data.fullName ?? ''),
                    avatarUrl: String(data.avatar_url ?? data.avatarUrl ?? data.company_logo_url ?? ''),
                    role: data.role as UserProfile['role'],
                    company_name: data.company_name,
                    last_active_at: data.last_active_at
                });
            }
            if (results.length >= 20) break; // Limit fast response
        }
        return results;
    } catch (err) {
        console.error('Searching global users failed:', err);
        return [];
    }
}
