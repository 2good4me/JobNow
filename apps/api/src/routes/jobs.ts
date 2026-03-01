import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createJob, getNearbyJobs } from '../controllers/job.controller';

const router = Router();

// Public routes
router.get('/nearby', getNearbyJobs);

// Protected routes (Employer only conceptually, but currently any authenticated user)
router.post('/', requireAuth, createJob);

export default router;
