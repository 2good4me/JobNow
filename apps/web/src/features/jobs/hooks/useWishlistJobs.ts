import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    query,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Job } from '@jobnow/types';

// Assuming Job contains the basic fields we need. 
// We will store minimal denormalized data or just store jobId and fetch full jobs later.
// The firestore rules allow create/delete on /users/{userId}/wishlist_jobs/{jobId}

export interface WishlistJob {
    job_id: string;
    user_id: string;
    created_at: any;
    // We can also store denormalized job data here if we want to save reads
}

export function useWishlistJobs(userId: string | undefined) {
    return useQuery({
        queryKey: ['wishlist', userId],
        queryFn: async () => {
            if (!userId) return [];

            // 1. Get all bookmarked job IDs
            const wishlistRef = collection(db, 'users', userId, 'wishlist_jobs');
            const q = query(wishlistRef);
            const snapshot = await getDocs(q);

            if (snapshot.empty) return [];

            const bookmarkedJobIds = snapshot.docs.map(doc => doc.id);

            // 2. Fetch the actual job details for these IDs
            // Note: If the list is large, we might need to chunk the `in` query (max 10 items)
            // But doing parallel getDocs for each is okay for small wishlists
            const jobsRef = collection(db, 'jobs');

            const jobPromises = bookmarkedJobIds.map(id => getDoc(doc(jobsRef, id)));
            const jobDocs = await Promise.all(jobPromises);

            return jobDocs
                .filter(doc => doc.exists())
                .map(doc => ({ id: doc.id, ...doc.data() } as Job));
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export function useIsJobWishlisted(userId: string | undefined, jobId: string | undefined) {
    return useQuery({
        queryKey: ['wishlist-check', userId, jobId],
        queryFn: async () => {
            if (!userId || !jobId) return false;

            const docRef = doc(db, 'users', userId, 'wishlist_jobs', jobId);
            const snapshot = await getDoc(docRef);
            return snapshot.exists();
        },
        enabled: !!userId && !!jobId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export function useToggleWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, jobId, isCurrentlyWishlisted }: { userId: string, jobId: string, isCurrentlyWishlisted: boolean }) => {
            if (!userId || !jobId) throw new Error('Missing user or job ID');

            const docRef = doc(db, 'users', userId, 'wishlist_jobs', jobId);

            if (isCurrentlyWishlisted) {
                // Remove bookmark
                await deleteDoc(docRef);
                return { action: 'removed', jobId };
            } else {
                // Add bookmark
                await setDoc(docRef, {
                    job_id: jobId,
                    user_id: userId,
                    created_at: serverTimestamp()
                });
                return { action: 'added', jobId };
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate the boolean check and the main list
            queryClient.invalidateQueries({ queryKey: ['wishlist-check', variables.userId, variables.jobId] });
            queryClient.invalidateQueries({ queryKey: ['wishlist', variables.userId] });
        }
    });
}
