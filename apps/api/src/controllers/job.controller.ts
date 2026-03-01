import { Request, Response } from 'express';
import { jobService, JobData } from '../services/job.service';
import { AuthRequest } from '../middleware/auth';

export const createJob = async (req: AuthRequest, res: Response) => {
    try {
        const jobData: JobData = req.body;

        if (!req.user || !req.user.uid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Force the employer_id to be the currently authenticated user
        jobData.employer_id = req.user.uid;

        // Basic validation
        if (!jobData.title || !jobData.location || !jobData.location.latitude || !jobData.location.longitude) {
            res.status(400).json({ error: 'Missing required job fields' });
            return;
        }

        const createdJob = await jobService.createJob(jobData);
        res.status(201).json({
            message: 'Job created successfully',
            job: createdJob
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
};

export const getNearbyJobs = async (req: Request, res: Response) => {
    try {
        const lat = parseFloat(req.query.lat as string);
        const lng = parseFloat(req.query.lng as string);
        const radius = parseFloat(req.query.radius as string) || 5000; // default 5km

        if (isNaN(lat) || isNaN(lng)) {
            res.status(400).json({ error: 'Valid latitude and longitude are required' });
            return;
        }

        const jobs = await jobService.getNearbyJobs(lat, lng, radius);
        res.status(200).json({
            message: 'Jobs retrieved successfully',
            data: jobs
        });
    } catch (error) {
        console.error('Error fetching nearby jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};
