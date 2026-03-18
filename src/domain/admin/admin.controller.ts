import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { createSuccessResponse, createErrorResponse } from '../../utils/api-response.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';
import { HandleException } from '../../utils/handleException.utils';

export const adminController = {
  async getBestProfession(req: Request, res: Response) {
    try {
      const start = new Date(req.query.start as string);
      const end = new Date(req.query.end as string);
      
      const result = await adminService.getBestProfession(start, end);
      
      return res.status(HTTP_STATUS.OK.code).json(
        createSuccessResponse(MESSAGES.ADMIN.BEST_PROFESSION, result)
      );
    } catch (err) {
      const error = err as HandleException;
      return res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(
        createErrorResponse(error)
      );
    }
  },

  async getBestClients(req: Request, res: Response) {
    try {
      const start = new Date(req.query.start as string);
      const end = new Date(req.query.end as string);
      const limit = req.query.limit ? Number(req.query.limit) : 2;
      
      const results = await adminService.getBestClients(start, end, limit);
      
      return res.status(HTTP_STATUS.OK.code).json(
        createSuccessResponse(MESSAGES.ADMIN.BEST_CLIENTS, results)
      );
    } catch (err) {
      const error = err as HandleException;
      return res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(
        createErrorResponse(error)
      );
    }
  },
};
