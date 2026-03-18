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
    return res.status(200).json(existingKey.response);
  }

  req.idempotencyKey = idempotencyKey;
  next();
};
