import { Router } from 'express';
import { getProfile, generalLimiter, checkIdempotency } from '../../middleware';
import { profilesController } from './profiles.controller';
import { validateDepositParams, validateDepositBody } from './profiles.validation';

const router = Router();

router.post(
  '/deposit/:userId',
  generalLimiter,
  getProfile,
  checkIdempotency,
  validateDepositParams,
  validateDepositBody,
  profilesController.deposit
);

export { router as profilesRouter };
