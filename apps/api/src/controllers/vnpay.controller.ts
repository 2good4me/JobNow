import { Request, Response } from 'express';
import { vnpayService } from '../services/vnpay.service';
import { db } from '../config/firebase';

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

        // Transaction creation will be handled by UI (Frontend) / Real Webhook to avoid Admin SDK local crash.
        res.status(200).json({ url: paymentUrl, orderId });
    } catch (error: any) {
        console.error('Create Payment URL error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message, stack: error.stack });
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
            // Success - process wallet topup
            await db.runTransaction(async (t) => {
                const walletRef = db.collection('wallets').doc(userId);
                const walletDoc = await t.get(walletRef);
                
                let currentBalance = 0;
                if (walletDoc.exists) {
                    currentBalance = walletDoc.data()?.balance || 0;
                }

                // Update Transaction status
                t.update(txRef, { status: 'COMPLETED', updatedAt: new Date() });
                
                // Update Wallet balance
                t.set(walletRef, { 
                    balance: currentBalance + vnp_Amount,
                    userId,
                    updatedAt: new Date()
                }, { merge: true });
            });
            
            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        } else {
            // Failed
            await txRef.update({ status: 'FAILED', updatedAt: new Date() });
            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success (Failed Transaction)' });
        }
    } catch (error) {
        console.error('IPN processing error:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};
