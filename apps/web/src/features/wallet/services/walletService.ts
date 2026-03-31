import { collection, query, where, getDocs, doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase';

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
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) return 0;
    return snapshot.data()?.balance ?? 0;
}

/**
 * Fetch transaction history for a user.
 */
export async function fetchTransactions(userId: string, pageSize = 20): Promise<TransactionRecord[]> {
    try {
        const txRef = collection(db, 'transactions');
        const q1 = query(txRef, where('userId', '==', userId));
        const q2 = query(txRef, where('user_id', '==', userId));
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const allDocs = [...snap1.docs, ...snap2.docs];
        
        return dedupeById(allDocs.map(mapTransaction))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, pageSize);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

export function subscribeWalletBalance(
    userId: string,
    onUpdate: (balance: number) => void
): Unsubscribe {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (snapshot) => {
        const data = snapshot.data();
        onUpdate(data?.balance ?? 0);
    }, (error) => {
        console.error('Error subscribing to wallet balance:', error);
    });
}

/**
 * Subscribe to transaction history for a user.
 */
export function subscribeTransactions(
    userId: string,
    onUpdate: (transactions: TransactionRecord[]) => void,
    pageSize = 20
): Unsubscribe {
    const txRef = collection(db, 'transactions');
    
    const q1 = query(txRef, where('userId', '==', userId));
    const q2 = query(txRef, where('user_id', '==', userId));

    let items1: TransactionRecord[] = [];
    let items2: TransactionRecord[] = [];

    const flush = () => {
        const results = dedupeById([...items1, ...items2])
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, pageSize);
        onUpdate(results);
    };

    const unsub1 = onSnapshot(q1, (snapshot) => {
        items1 = snapshot.docs.map(mapTransaction);
        flush();
    }, (error) => {
        console.error('Error subscribing to transactions (q1):', error);
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
        items2 = snapshot.docs.map(mapTransaction);
        flush();
    }, (error) => {
        console.error('Error subscribing to transactions (q2):', error);
    });

    return () => {
        unsub1();
        unsub2();
    };
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
    const seen = new Set();
    return items.filter(it => {
        if (seen.has(it.id)) return false;
        seen.add(it.id);
        return true;
    });
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
    const balance = await getWalletBalance(employerId);
    if (balance < amount) {
        throw new Error(`Số dư không đủ để thanh toán (${amount.toLocaleString('vi-VN')}đ). Vui lòng nạp thêm tiền vào ví.`);
    }

    const callable = httpsCallable<
        { applicationId: string; employerId: string; candidateId: string; amount: number; jobId: string; jobTitle: string },
        { success: boolean }
    >(functions, 'processPayment');
    await callable({ applicationId, employerId, candidateId, amount, jobId, jobTitle: 'Thanh toán tiền lương' });
}

/**
 * Simulate a Deposit Cloud Function using client-side Firestore transactions.
 * NOTE: This is for demonstration until the backend functions are ready.
 */
export async function processDeposit(userId: string, amount: number, method: string): Promise<void> {
    if (amount <= 0) throw new Error('Số tiền phải lớn hơn 0');

    const callable = httpsCallable<
        { userId: string; amount: number; method: string },
        { success: boolean }
    >(functions, 'processDeposit');

    await callable({ userId, amount, method });
}

/**
 * Simulate a Withdrawal Cloud Function using client-side Firestore transactions.
 * NOTE: This is for demonstration until the backend functions are ready.
 */
export async function processWithdrawal(userId: string, amount: number, bankAccount: string): Promise<void> {
    if (amount <= 0) throw new Error('Số tiền phải lớn hơn 0');

    const callable = httpsCallable<
        { userId: string; amount: number; bankAccount: string },
        { success: boolean }
    >(functions, 'processWithdrawal');

    await callable({ userId, amount, bankAccount });
}

function mapTransaction(docSnap: any): TransactionRecord {
    const d = docSnap.data();
    return {
        id: docSnap.id,
        userId: d.userId || '',
        type: d.type || 'PAYMENT',
        amount: d.amount || 0,
        description: d.description || '',
        relatedJobId: d.relatedJobId || d.related_job_id || undefined,
        relatedApplicationId: d.relatedApplicationId || d.related_application_id || undefined,
        status: d.status || 'PENDING',
        createdAt: (d.created_at?.toDate?.() || d.createdAt?.toDate?.() || new Date(d.created_at || d.createdAt || Date.now())),
    };
}
