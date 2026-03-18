import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../../utils/api-response.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { HandleException } from '../../utils/handleException.utils';

const payJobParamsSchema = Joi.object({
  job_id: Joi.number().integer().positive().required(),
});

export const validatePayJobParams = (req: Request, res: Response, next: NextFunction) => {
  const { error } = payJobParamsSchema.validate(req.params, { allowUnknown: false, abortEarly: false });
  
  if (error) {
    const err = new HandleException(HTTP_STATUS.BAD_REQUEST.code, error.message, HTTP_STATUS.BAD_REQUEST.name);
    return res.status(HTTP_STATUS.BAD_REQUEST.code).json(createErrorResponse(err));
  }
  next();
};
