import { Request, Response, NextFunction } from 'express';
import { HandleException } from '../utils/handleException.utils';
import { HTTP_STATUS } from '../constants/httpStatus';
import { createErrorResponse } from '../utils/api-response.utils';

export const notFound = (req: Request, res: Response) => {
  const error = new HandleException(
    HTTP_STATUS.NOT_FOUND.code,
    `Route ${req.method} ${req.path} not found`,
    HTTP_STATUS.NOT_FOUND.name
  );
  res.status(error.status).json(createErrorResponse(error));
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = err instanceof HandleException
    ? err
    : new HandleException(
        HTTP_STATUS.SERVER_ERROR.code,
        'An unexpected error occurred',
        HTTP_STATUS.SERVER_ERROR.name
      );
  res.status(error.status).json(createErrorResponse(error));
};
