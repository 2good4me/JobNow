import { collection, getDocs, doc, setDoc, deleteDoc, query, where, getCountFromServer, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface CategoryData {
    id: string;
    name: string;
    description?: string;
    jobCount: number;
    createdAt?: Date;
}

/**
 * Fetch all categories and calculate job counts for each.
 */
export async function fetchAdminCategories(): Promise<CategoryData[]> {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);

    const categories: CategoryData[] = [];
    const jobsRef = collection(db, 'jobs');

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const id = docSnap.id;
        const name = String(data.name || id);
        
        // Count jobs referencing this category by name or ID
        const q1 = query(jobsRef, where('category_id', '==', name));
        const q2 = query(jobsRef, where('categoryId', '==', name));
        const q3 = query(jobsRef, where('category_id', '==', id));
        const q4 = query(jobsRef, where('categoryId', '==', id));

        const [c1, c2, c3, c4] = await Promise.all([
            getCountFromServer(q1),
            getCountFromServer(q2),
            getCountFromServer(q3),
            getCountFromServer(q4),
        ]);

        const totalJobs = c1.data().count + c2.data().count + c3.data().count + c4.data().count;

        categories.push({
            id,
            name,
            description: data.description || '',
            jobCount: totalJobs,
            createdAt: data.created_at?.toDate() || data.createdAt?.toDate() || new Date(),
        });
    }

    // Sort by most jobs first
    categories.sort((a, b) => b.jobCount - a.jobCount);
    return categories;
}

/**
 * Create or update a category
 */
export async function saveCategory(id: string, name: string, description: string): Promise<void> {
    const docRef = doc(db, 'categories', id || name.toLowerCase().replace(/\s+/g, '-'));
    await setDoc(docRef, {
        name,
        description,
        updated_at: serverTimestamp(),
        created_at: serverTimestamp(), // If exists, this gets overwritten or use merge
    }, { merge: true });
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, 'categories', id));
}
