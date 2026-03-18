import { Router } from 'express';
import { analyticsLimiter } from '../../middleware';
import { adminController } from './admin.controller';
import { validateDateRangeQuery } from './admin.validation';

const router = Router();

router.get('/best-profession', analyticsLimiter, validateDateRangeQuery, adminController.getBestProfession);
router.get('/best-clients', analyticsLimiter, validateDateRangeQuery, adminController.getBestClients);

export { router as adminRouter };
