import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getUserDocument } from '@/lib/firestore';

export interface TransactionRecord {
    id: string;
    userId: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT' | 'REFUND';
    amount: number;
    description: string;
    relatedJobId?: string;
    relatedApplicationId?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
}

/**
 * Fetch the user's wallet balance from the users document.
 */
export async function getWalletBalance(userId: string): Promise<number> {
    const user = await getUserDocument(userId);
    return user?.balance ?? 0;
}

/**
 * Fetch transaction history for a user.
 */
export async function fetchTransactions(userId: string, pageSize = 20): Promise<TransactionRecord[]> {
    const txRef = collection(db, 'transactions');
    const q = query(
        txRef,
        where('userId', '==', userId),
        orderBy('created_at', 'desc'),
        limit(pageSize)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapTransaction);
}

/**
 * Request a payment to a candidate.
 * NOTE: This triggers a Cloud Function — client cannot write to transactions directly.
 * For now, this is a placeholder that would call a callable Cloud Function.
 */
export async function requestPayment(
    employerId: string,
    candidateId: string,
    amount: number,
    jobId: string,
    applicationId: string
): Promise<void> {
    // In a real implementation, this would call:
    // const processPayment = httpsCallable(functions, 'processPayment');
    // await processPayment({ candidateId, amount, jobId, applicationId });

    // Placeholder: Log the intent
    console.log('[Wallet] Payment request:', { employerId, candidateId, amount, jobId, applicationId });
    throw new Error('Cloud Function chưa được triển khai. Vui lòng liên hệ admin.');
}

function mapTransaction(docSnap: any): TransactionRecord {
    const d = docSnap.data();
    return {
        id: docSnap.id,
        userId: d.userId || '',
        type: d.type || 'PAYMENT',
        amount: d.amount || 0,
        description: d.description || '',
        relatedJobId: d.relatedJobId || undefined,
        relatedApplicationId: d.relatedApplicationId || undefined,
        status: d.status || 'PENDING',
        createdAt: d.created_at?.toDate?.() ?? new Date(),
    };
}
