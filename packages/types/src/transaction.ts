export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    description: string;
    relatedJobId?: string;
    relatedApplicationId?: string;
    counterpartyId?: string;     // ID of the other party (employer/candidate)
    status: TransactionStatus;
    createdAt?: any;
}
