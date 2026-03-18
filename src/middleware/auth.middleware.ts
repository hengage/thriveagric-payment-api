import { Request, Response, NextFunction } from 'express';
import { profilesRepository } from '../domain/profiles/profiles.repository';
import { HandleException } from '../utils/handleException.utils';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../utils/messages';
import { createErrorResponse } from '../utils/api-response.utils';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profileId = req.headers['profile_id'];
    if (!profileId) {
      throw new HandleException(
        HTTP_STATUS.UNAUTHORIZED.code,
        MESSAGES.AUTH.MISSING_HEADER,
        HTTP_STATUS.UNAUTHORIZED.name
      );
    }
    req.profile = await profilesRepository.findByIdOrThrow(Number(profileId));
    next();
  } catch (err) {
    const error = err as HandleException;
    res.status(error.status || HTTP_STATUS.SERVER_ERROR.code).json(createErrorResponse(error));
  }
};
