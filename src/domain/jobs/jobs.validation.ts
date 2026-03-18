import Joi from 'joi';
import { JOI_VALIDATION_CODES } from '../../constants/joiCodes';
import { MESSAGES } from '../../utils/messages';

export const payJobSchema = Joi.object({
  params: Joi.object({
    job_id: Joi.number().integer().positive().required().messages({
      [JOI_VALIDATION_CODES.NUMBER_BASE]: MESSAGES.VALIDATION.FIELD_NUMBER('job_id'),
      [JOI_VALIDATION_CODES.ANY_REQUIRED]: MESSAGES.VALIDATION.FIELD_REQUIRED('job_id'),
    }),
  }),
});
