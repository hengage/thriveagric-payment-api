import { Router } from 'express';
import { contractsController } from './contracts.controller';
import {generalLimiter, getProfile} from '../../middleware';

const router = Router();

router.get('/:id', generalLimiter, getProfile, contractsController.getContractById);
router.get('/', generalLimiter, getProfile, contractsController.getContracts);

export { router as contractsRouter };
