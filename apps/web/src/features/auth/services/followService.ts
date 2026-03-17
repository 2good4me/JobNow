import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    getCountFromServer
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { notifyNewFollower } from '@/features/notifications/services/notificationService';
import { getUserProfile, UserProfile } from './authService';

/**
 * Toggle follow status for an employer
 */
export async function toggleFollow(followerId: string, employerId: string): Promise<boolean> {
    try {
        const followId = `${followerId}_${employerId}`;
        const followRef = doc(db, 'follows', followId);

        const snap = await getDoc(followRef);
        if (snap.exists()) {
            await deleteDoc(followRef);
            return false; // Unfollowed
        } else {
            await setDoc(followRef, {
                follower_id: followerId,
                employer_id: employerId,
                created_at: serverTimestamp()
            });

            // Gửi thông báo cho nhà tuyển dụng
            try {
                const followerSnap = await getDoc(doc(db, 'users', followerId));
                const followerName = followerSnap.exists()
                    ? (followerSnap.data().full_name || followerSnap.data().fullName || 'Một người dùng')
                    : 'Một người dùng';
                await notifyNewFollower(followerId, followerName, employerId);
            } catch (err) {
                console.error('Failed to send follow notification:', err);
            }

            return true; // Followed
        }
    } catch (error: any) {
        console.error('Error in toggleFollow:', error);
        throw error;
    }
}

/**
 * Check if a user is following an employer
 */
export async function checkFollowStatus(followerId: string, employerId: string): Promise<boolean> {
    const followId = `${followerId}_${employerId}`;
    const followRef = doc(db, 'follows', followId);
    const snap = await getDoc(followRef);
    return snap.exists();
}

/**
 * Get follower count for an employer (simplified)
 */
export async function getFollowerCount(employerId: string): Promise<number> {
    const q = query(collection(db, 'follows'), where('employer_id', '==', employerId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
}

/**
 * Get count of employers a user is following
 */
export async function getFollowingCount(followerId: string): Promise<number> {
    const q = query(collection(db, 'follows'), where('follower_id', '==', followerId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
}

/**
 * Get list of followers for an employer
 */
export async function getFollowers(employerId: string) {
    const q = query(collection(db, 'follows'), where('employer_id', '==', employerId));
    const snap = await getDocs(q);
    const followerIds = snap.docs.map(doc => doc.data().follower_id);

    const profiles = await Promise.all(
        followerIds.map(id => getUserProfile(id))
    );
    return (profiles as (UserProfile | null)[]).filter((p): p is UserProfile => p !== null);
}

/**
 * Get list of employers a user is following
 */
export async function getFollowing(followerId: string) {
    const q = query(collection(db, 'follows'), where('follower_id', '==', followerId));
    const snap = await getDocs(q);
    const employerIds = snap.docs.map(doc => doc.data().employer_id);
    
    const profiles = await Promise.all(
        employerIds.map(id => getUserProfile(id))
    );
    return (profiles as (UserProfile | null)[]).filter((p): p is UserProfile => p !== null);
}
