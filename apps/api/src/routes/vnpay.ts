import { Router } from 'express';
import { createPaymentUrl, vnpayIpn, completePayment } from '../controllers/vnpay.controller';

const router = Router();

router.post('/create-payment-url', createPaymentUrl);
router.get('/ipn', vnpayIpn);
router.get('/complete-payment', completePayment);

export default router;
