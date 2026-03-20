import { Router } from 'express';
import { createPaymentUrl, vnpayIpn } from '../controllers/vnpay.controller';

const router = Router();

router.post('/create-payment-url', createPaymentUrl);
router.get('/ipn', vnpayIpn);

export default router;
