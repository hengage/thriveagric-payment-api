import { Router } from 'express';
import { generalLimiter } from '../../middleware/rateLimit.middleware';
import { getProfile } from '../../middleware/auth.middleware';
import { jobsController } from './jobs.controller';

const router = Router();

// TODO: define routes
// router.get('/', generalLimiter, getProfile, jobsController.getAll);

export { router as jobsRouter };
