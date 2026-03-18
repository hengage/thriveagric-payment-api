import { Request, Response } from 'express';
import { profilesService } from './profiles.service';
import { createSuccessResponse, createErrorResponse } from '../../utils/response.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';
import { HandleException } from '../../utils/handleException.utils';

export const profilesController = {
  async getAll(req: Request, res: Response) {
    try {
      // const result = await profilesService.getAll();
      // return res.status(HTTP_STATUS.OK.code).json(createSuccessResponse('Fetched successfully', result));
    } catch (err) {
      const error = err as HandleException;
      return res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(createErrorResponse(error));
    }
  },
};
