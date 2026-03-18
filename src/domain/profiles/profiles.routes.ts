import { Router } from 'express';
import { generalLimiter } from '../../middleware/rateLimit.middleware';
import { getProfile } from '../../middleware/auth.middleware';
import { profilesController } from './profiles.controller';

const router = Router();

// TODO: define routes
// router.get('/', generalLimiter, getProfile, profilesController.getAll);

export { router as profilesRouter };
