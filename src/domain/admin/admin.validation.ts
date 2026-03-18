import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../../utils/api-response.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { HandleException } from '../../utils/handleException.utils';

const dateRangeQuerySchema = Joi.object({
  start: Joi.date().iso().required(),
  end: Joi.date().iso().min(Joi.ref('start')).required(),
  limit: Joi.number().integer().positive().optional(),
});

export const validateDateRangeQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error } = dateRangeQuerySchema.validate(req.query, { allowUnknown: false, abortEarly: false, presence: 'required' });
  
  if (error) {
    const err = new HandleException(HTTP_STATUS.BAD_REQUEST.code, error.message, HTTP_STATUS.BAD_REQUEST.name);
    return res.status(HTTP_STATUS.BAD_REQUEST.code).json(createErrorResponse(err));
  }
  next();
};
