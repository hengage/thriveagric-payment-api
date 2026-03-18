import { Router } from 'express';
import { getProfile } from '../../middleware/auth.middleware';
import { generalLimiter } from '../../middleware/rateLimit.middleware';
import { jobsController } from './jobs.controller';
import { validate } from '../../utils/validation.utils';
import { payJobSchema } from './jobs.validation';

const router = Router();

router.get('/unpaid', generalLimiter, getProfile, jobsController.getUnpaidJobs);
router.post('/:job_id/pay', generalLimiter, getProfile, validate(payJobSchema), jobsController.payJob);

export { router as jobsRouter };
