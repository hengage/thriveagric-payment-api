import { Request, Response } from 'express';
import { jobsService } from './jobs.service';
import { createSuccessResponse, createErrorResponse } from '../../utils/api-response.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';
import { HandleException } from '../../utils/handleException.utils';

export const jobsController = {
  async getUnpaidJobs(req: Request, res: Response) {
    try {
      const jobs = await jobsService.getUnpaidJobs(req.profile.id);
      return res.status(HTTP_STATUS.OK.code).json(
        createSuccessResponse(MESSAGES.JOB.UNPAID_FETCHED, jobs)
      );
    } catch (err) {
      const error = err as HandleException;
      return res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(
        createErrorResponse(error)
      );
    }
  },

  async payJob(req: Request, res: Response) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] as string;
      const result = await jobsService.payJob(
        Number(req.params.job_id),
        req.profile.id,
        idempotencyKey
      );
      return res.status(HTTP_STATUS.OK.code).json(
        createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, result)
      );
    } catch (err) {
      const error = err as HandleException;
      return res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(
        createErrorResponse(error)
      );
    }
  },
};
