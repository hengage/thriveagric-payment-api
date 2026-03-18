import { toMajorUnits } from './money.utils';

export const MESSAGES = {
  CONTRACT: {
    NOT_FOUND:  'Contract not found or does not belong to you',
    FETCHED:    'Contract retrieved successfully',
    LIST:       'Contracts retrieved successfully',
  },
  JOB: {
    NOT_FOUND:      'Job not found',
    ALREADY_PAID:   'This job has already been paid',
    NOT_YOUR_JOB:   'You are not the client for this job',
    UNPAID_FETCHED: 'Unpaid jobs retrieved successfully',
  },
  PAYMENT: {
    INSUFFICIENT_BALANCE: 'Insufficient balance to complete this payment',
    SUCCESS:              'Payment completed successfully',
  },
  DEPOSIT: {
    LIMIT_EXCEEDED: (limit: number) =>
      `Deposit amount exceeds the maximum allowed (25% of unpaid jobs = ${toMajorUnits(BigInt(limit))})`,
    SUCCESS: 'Deposit completed successfully',
  },
  AUTH: {
    MISSING_HEADER:  'Missing profile_id header',
    PROFILE_NOT_FOUND: 'Authenticated profile not found',
  },
  IDEMPOTENCY: {
    KEY_REQUIRED: 'Idempotency-Key header is required for this endpoint',
    DUPLICATE:    'Duplicate request — returning cached response',
  },
  ADMIN: {
    BEST_PROFESSION: 'Best profession retrieved successfully',
    BEST_CLIENTS:    'Best clients retrieved successfully',
  },
  VALIDATION: {
    FIELD_NUMBER:    (field: string) => `${field} must be a number`,
    FIELD_REQUIRED:  (field: string) => `${field} is required`,
    INVALID_NUMBER:  (field: string) => `${field} must be a valid positive number`,
    DATE_REQUIRED:   'Date is required',
    DATE_ISO:        'Date must be a valid ISO date string',
  },
} as const;
