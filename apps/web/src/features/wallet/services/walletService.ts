import { collection, query, where, orderBy, limit, getDocs, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
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

/**
 * Simulate a Deposit Cloud Function using client-side Firestore transactions.
 * NOTE: This is for demonstration until the backend functions are ready.
 */
export async function processDeposit(userId: string, amount: number, method: string): Promise<void> {
    if (amount <= 0) throw new Error('Số tiền phải lớn hơn 0');

    const userRef = doc(db, 'users', userId);
    const newTxRef = doc(collection(db, 'transactions'));

    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
            throw new Error('User does not exist');
        }

        const currentBalance = userDoc.data().balance || 0;
        const newBalance = currentBalance + amount;

        // Update balance
        transaction.update(userRef, { balance: newBalance });

        // Add transaction log
        transaction.set(newTxRef, {
            userId,
            type: 'DEPOSIT',
            amount,
            description: `Nạp tiền qua ${method}`,
            status: 'COMPLETED',
            created_at: serverTimestamp(),
        });
    });
}

/**
 * Simulate a Withdrawal Cloud Function using client-side Firestore transactions.
 * NOTE: This is for demonstration until the backend functions are ready.
 */
export async function processWithdrawal(userId: string, amount: number, bankAccount: string): Promise<void> {
    if (amount <= 0) throw new Error('Số tiền phải lớn hơn 0');

    const userRef = doc(db, 'users', userId);
    const newTxRef = doc(collection(db, 'transactions'));

    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
            throw new Error('User does not exist');
        }

        const currentBalance = userDoc.data().balance || 0;
        if (currentBalance < amount) {
            throw new Error('Số dư không đủ để thực hiện giao dịch');
        }

        const newBalance = currentBalance - amount;

        // Update balance
        transaction.update(userRef, { balance: newBalance });

        // Add transaction log
        transaction.set(newTxRef, {
            userId,
            type: 'WITHDRAW',
            amount,
            description: `Rút tiền về ${bankAccount}`,
            status: 'COMPLETED', // usually PENDING in real world
            created_at: serverTimestamp(),
        });
    });
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
