import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit as queryLimit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    startAfter,
    type QueryDocumentSnapshot,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { JobWishlistItem } from '@jobnow/types';

export interface WishlistPage {
    items: JobWishlistItem[];
    nextCursor?: string;
}

interface WishlistDoc {
    job_id: string;
    user_id: string;
    saved_at?: any;
}

function toWishlistItem(snapshot: QueryDocumentSnapshot): JobWishlistItem {
    const data = snapshot.data() as WishlistDoc;

    return {
        userId: data.user_id,
        jobId: data.job_id,
        savedAt: data.saved_at,
    };
}

function encodeCursor(id: string): string {
    return btoa(JSON.stringify({ id }));
}

function decodeCursor(cursor?: string): { id: string } | null {
    if (!cursor) return null;
    try {
        return JSON.parse(atob(cursor)) as { id: string };
    } catch {
        return null;
    }
}

export async function addWishlistJob(uid: string, jobId: string): Promise<void> {
    const wishlistRef = doc(db, 'users', uid, 'wishlist_jobs', jobId);
    await setDoc(wishlistRef, {
        user_id: uid,
        job_id: jobId,
        saved_at: serverTimestamp(),
    }, { merge: true });
}

export async function removeWishlistJob(uid: string, jobId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'wishlist_jobs', jobId));
}

export async function listWishlistJobs(uid: string, cursor?: string, pageSize = 20): Promise<WishlistPage> {
    const wishlistRef = collection(db, 'users', uid, 'wishlist_jobs');
    const decoded = decodeCursor(cursor);

    let q = query(
        wishlistRef,
        orderBy('saved_at', 'desc'),
        queryLimit(pageSize)
    );

    if (decoded?.id) {
        const cursorDoc = await getDoc(doc(db, 'users', uid, 'wishlist_jobs', decoded.id));
        if (cursorDoc.exists()) {
            q = query(
                wishlistRef,
                orderBy('saved_at', 'desc'),
                startAfter(cursorDoc),
                queryLimit(pageSize)
            );
        }
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    return {
        items: docs.map(toWishlistItem),
        nextCursor: docs.length === pageSize ? encodeCursor(docs[docs.length - 1].id) : undefined,
    };
}

export function subscribeWishlist(uid: string, onUpdate: (items: JobWishlistItem[]) => void): Unsubscribe {
    const wishlistRef = collection(db, 'users', uid, 'wishlist_jobs');
    const q = query(wishlistRef, orderBy('saved_at', 'desc'));

    return onSnapshot(q, (snapshot) => {
        onUpdate(snapshot.docs.map(toWishlistItem));
    });
}
