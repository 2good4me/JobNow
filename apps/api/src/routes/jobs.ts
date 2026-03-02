import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createJob, getNearbyJobs, seedJobs } from '../controllers/job.controller';
import { env } from '../config/env';

const router = Router();

// Public routes
router.get('/nearby', getNearbyJobs);

// Protected routes (Employer only conceptually, but currently any authenticated user)
router.post('/', requireAuth, createJob);

// Development only: seed sample data
if (env.NODE_ENV === 'development') {
    router.post('/seed', seedJobs);
}

export default router;
