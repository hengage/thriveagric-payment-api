import { Request, Response } from 'express';
import { profilesService } from './profiles.service';
import { createSuccessResponse, createErrorResponse } from '../../utils/api-response.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';
import { HandleException } from '../../utils/handleException.utils';
import { toMinorUnits } from '../../utils/money.utils';

export const profilesController = {
  async deposit(req: Request, res: Response) {
    try {
      const result = await profilesService.deposit(
        Number(req.params.userId),
        toMinorUnits(req.body.amount),
        req.idempotencyKey!
      );
      return res.status(HTTP_STATUS.OK.code).json(
        createSuccessResponse(MESSAGES.DEPOSIT.SUCCESS, result)
      );
    } catch (err) {
      const error = err as HandleException;
      return res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(
        createErrorResponse(error)
      );
    }
  },
};
