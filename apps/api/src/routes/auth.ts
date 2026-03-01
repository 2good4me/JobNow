import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/verify', requireAuth, (req: AuthRequest, res) => {
    res.status(200).json({
        message: 'Token verified successfully',
        user: req.user
    });
});

export default router;
