import createError from 'http-errors';
import { HTTP_STATUS } from '../constants/httpStatus';

export class HandleException extends Error {
  public status: number;

  constructor(
    status: number,
    message: string,
    name: string = HTTP_STATUS.SERVER_ERROR.name,
    isHttpError = false
  ) {
    super(message);
    this.name = name;
    this.status = status;
    this.message = message;

    if (isHttpError) {
      Object.setPrototypeOf(this, createError(status, message));
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
