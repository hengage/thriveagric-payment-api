import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from './api-response.utils';
import { HTTP_STATUS } from '../constants/httpStatus';
import { HandleException } from './handleException.utils';

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const toValidate: Record<string, any> = {};
    
    if (req.params && Object.keys(req.params).length) {
      toValidate.params = req.params;
    }
    if (req.body && Object.keys(req.body).length) {
      toValidate.body = req.body;
    }
    if (req.query && Object.keys(req.query).length) {
      toValidate.query = req.query;
    }
    
    const { error } = schema.validate(toValidate, { abortEarly: false });
    
    if (error) {
      const details = error.details.reduce((acc, d) => {
        acc[d.path.join('.')] = d.message;
        return acc;
      }, {} as Record<string, string>);
      
      const err = new HandleException(
        HTTP_STATUS.BAD_REQUEST.code,
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST.name
      );
      return res.status(HTTP_STATUS.BAD_REQUEST.code).json(
        createErrorResponse(err, details)
      );
    }
    next();
  };
}
