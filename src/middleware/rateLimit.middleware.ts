import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { ENV } from '../config/env';

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: ENV.RATE_LIMIT_GENERAL,
  keyGenerator: (req) => String(req.headers['profile_id']) || ipKeyGenerator(req.ip ?? ''),
  standardHeaders: true,
  legacyHeaders: false,
});

export const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: ENV.RATE_LIMIT_ANALYTICS,
  keyGenerator: (req) => String(req.headers['profile_id']) || ipKeyGenerator(req.ip ?? ''),
});