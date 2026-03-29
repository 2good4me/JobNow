import { Request, Response } from 'express';
import { vnpayService } from '../services/vnpay.service';
import { admin, db } from '../config/firebase';

// Endpoint riêng cho client-side sau khi trở về từ VNPay (không cần checksum).
// Dùng cho local dev vì Express decode URL params làm sai checksum.
export const completePayment = async (req: Request, res: Response) => {
    try {
        const { vnp_TxnRef, vnp_ResponseCode, vnp_Amount } = req.query as Record<string, string>;

        if (!vnp_TxnRef || !vnp_ResponseCode) {
            return res.status(400).json({ RspCode: '99', Message: 'Missing params' });
        }

        const txRef = db.collection('transactions').doc(vnp_TxnRef);
        const txDoc = await txRef.get();

        if (!txDoc.exists) {
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        const txData = txDoc.data();
        if (txData?.status === 'COMPLETED' || txData?.status === 'FAILED') {
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        if (vnp_ResponseCode === '00') {
            const amount = parseInt(vnp_Amount) / 100;
            const userId = vnp_TxnRef.split('_')[0];

            await db.runTransaction(async (t) => {
                const userRef = db.collection('users').doc(userId);
                const userDoc = await t.get(userRef);
                const currentBalance = userDoc.exists ? (userDoc.data()?.balance || 0) : 0;

                t.update(txRef, { status: 'COMPLETED', updatedAt: new Date(), updated_at: new Date() });
                t.set(userRef, { balance: currentBalance + amount, updated_at: new Date() }, { merge: true });
            });

            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        } else {
            await txRef.update({ status: 'FAILED', updatedAt: new Date(), updated_at: new Date() });
            return res.status(200).json({ RspCode: '00', Message: 'Transaction failed' });
        }
    } catch (error) {
        console.error('completePayment error:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

export const createPaymentUrl = async (req: Request, res: Response) => {
    try {
        const { amount, bankCode, userId } = req.body;
        
        if (!amount || !userId) {
            return res.status(400).json({ message: 'Missing amount or userId' });
        }

        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const orderId = `${userId}_${Date.now()}`;
        const orderInfo = `Nap tien vao vi JobNow (User: ${userId})`;
        const returnUrl = req.headers.origin 
            ? `${req.headers.origin}/employer/vnpay-return` 
            : 'http://localhost:5173/employer/vnpay-return';

        const paymentUrl = vnpayService.createPaymentUrl(
            ipAddr as string,
            amount,
            orderInfo,
            orderId,
            returnUrl
        );

        await db.collection('transactions').doc(orderId).set({
            userId,
            user_id: userId,
            type: 'DEPOSIT',
            amount,
            description: `Nạp tiền qua VNPAY-QR`,
            external_ref: orderId,
            status: 'PENDING',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        res.status(200).json({ url: paymentUrl, orderId });
    } catch (error: any) {
        console.error('❌ VNPay Create Payment Error:', error);
        res.status(500).json({ 
            message: 'Internal Server Error', 
            error: error.message,
            code: error.code,
            stack: error.stack 
        });
    }
};

export const vnpayIpn = async (req: Request, res: Response) => {
    try {
        const isValid = vnpayService.verifyIpn(req.query);
        
        if (!isValid) {
            return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }

        const vnp_ResponseCode = req.query.vnp_ResponseCode;
        const vnp_TxnRef = req.query.vnp_TxnRef as string;
        const vnp_Amount = parseInt(req.query.vnp_Amount as string) / 100;

        // Extract userId from TxnRef (format: userId_timestamp)
        const userId = vnp_TxnRef.split('_')[0];

        // Check if transaction exists
        const txRef = db.collection('transactions').doc(vnp_TxnRef);
        const txDoc = await txRef.get();

        if (!txDoc.exists) {
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        const txData = txDoc.data();
        if (txData?.status === 'COMPLETED' || txData?.status === 'FAILED') {
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        if (vnp_ResponseCode === '00') {
            // Success - process user balance topup
            await db.runTransaction(async (t) => {
                const userRef = db.collection('users').doc(userId);
                const userDoc = await t.get(userRef);
                
                let currentBalance = 0;
                if (userDoc.exists) {
                    currentBalance = userDoc.data()?.balance || 0;
                }

                // Update Transaction status
                t.update(txRef, { status: 'COMPLETED', updatedAt: new Date(), updated_at: new Date() });
                
                // Update User balance
                t.set(userRef, { 
                    balance: currentBalance + vnp_Amount,
                    updated_at: new Date()
                }, { merge: true });
            });
            
            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        } else {
            // Failed
            await txRef.update({ status: 'FAILED', updatedAt: new Date(), updated_at: new Date() });
            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success (Failed Transaction)' });
        }
    } catch (error) {
        console.error('IPN processing error:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};
