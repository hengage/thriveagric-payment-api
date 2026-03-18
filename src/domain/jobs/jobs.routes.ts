import { Router } from 'express';
import { getProfile, generalLimiter, checkIdempotency } from '../../middleware';
import { jobsController } from './jobs.controller';
import { validatePayJobParams } from './jobs.validation';

const router = Router();

router.get('/unpaid', generalLimiter, getProfile, jobsController.getUnpaidJobs);
router.post('/:job_id/pay', generalLimiter, getProfile, checkIdempotency, validatePayJobParams, jobsController.payJob);

export { router as jobsRouter };
