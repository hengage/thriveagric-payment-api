import { Router } from 'express';
import { generalLimiter } from '../../middleware/rateLimit.middleware';
import { getProfile } from '../../middleware/auth.middleware';
import { contractsController } from './contracts.controller';

const router = Router();

// TODO: define routes
// router.get('/', generalLimiter, getProfile, contractsController.getAll);

export { router as contractsRouter };
