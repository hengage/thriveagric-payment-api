import { Request, Response } from 'express';
import { contractsService } from './contracts.service';
import { createSuccessResponse, createErrorResponse } from '../../utils/api-response.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';
import { HandleException } from '../../utils/handleException.utils';

export const contractsController = {
  async getContractById(req: Request, res: Response) {
    try {
      const contract = await contractsService.getContractById(
        Number(req.params.id),
        req.profile.id
      );
      return res.status(HTTP_STATUS.OK.code).json(
        createSuccessResponse(MESSAGES.CONTRACT.FETCHED, contract)
      );
    } catch (err) {
      const error = err as HandleException;
      return res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(
        createErrorResponse(error)
      );
    }
  },

  async getContracts(req: Request, res: Response) {
    try {
      const contracts = await contractsService.getContracts(req.profile.id);
      return res.status(HTTP_STATUS.OK.code).json(
        createSuccessResponse(MESSAGES.CONTRACT.LIST, contracts)
      );
    } catch (err) {
      const error = err as HandleException;
      return res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(
        createErrorResponse(error)
      );
    }
  },
};
