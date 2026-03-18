import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../../utils/api-response.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { HandleException } from '../../utils/handleException.utils';

const depositParamsSchema = Joi.object({
  userId: Joi.number().integer().positive().required().label('User ID'),
});

const depositBodySchema = Joi.object({
  amount: Joi.number().integer().positive().required().label('Amount'),
});

export const validateDepositParams = (req: Request, res: Response, next: NextFunction) => {
  const { error } = depositParamsSchema.validate(req.params, { allowUnknown: false, abortEarly: false });
  
  if (error) {
    const err = new HandleException(HTTP_STATUS.BAD_REQUEST.code, error.message, HTTP_STATUS.BAD_REQUEST.name);
    return res.status(HTTP_STATUS.BAD_REQUEST.code).json(createErrorResponse(err));
  }
  next();
};

export const validateDepositBody = (req: Request, res: Response, next: NextFunction) => {
  const { error } = depositBodySchema.validate(req.body, { allowUnknown: false, abortEarly: false, presence: 'required' });
  
  if (error) {
    const err = new HandleException(HTTP_STATUS.BAD_REQUEST.code, error.message, HTTP_STATUS.BAD_REQUEST.name);
    return res.status(HTTP_STATUS.BAD_REQUEST.code).json(createErrorResponse(err));
  }
  next();
};
