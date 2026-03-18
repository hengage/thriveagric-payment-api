import { Request, Response, NextFunction } from 'express';
import { idempotencyRepository } from '../common/idempotency';
import { HandleException } from '../utils/handleException.utils';
import { HTTP_STATUS } from '../constants/httpStatus';

export const checkIdempotency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    throw new HandleException(
      HTTP_STATUS.BAD_REQUEST.code,
      'Idempotency-Key header is required',
      HTTP_STATUS.BAD_REQUEST.name
    );
  }

  const existingKey = await idempotencyRepository.findByKey(idempotencyKey);

  if (existingKey) {
    const currentResourceId = req.params.job_id || req.params.userId;
    
    if (existingKey.resourceId === Number(currentResourceId)) {
      return res.status(HTTP_STATUS.OK.code).json(existingKey.response);
    }
    
    throw new HandleException(
      HTTP_STATUS.CONFLICT.code,
      'Idempotency key already used for a different resource',
      HTTP_STATUS.CONFLICT.name
    );
  }

  req.idempotencyKey = idempotencyKey;
  next();
};
