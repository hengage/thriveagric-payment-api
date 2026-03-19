import { sequelize } from '../../config/db';
import { jobsRepository } from './jobs.repository';
import { profilesRepository } from '../profiles/profiles.repository';
import { idempotencyRepository } from '../../common/idempotency';
import { HandleException } from '../../utils/handleException.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';
import { serializeJob } from '../../utils/serialize.utils';
import { Job } from './job.model';
import { Profile } from '../profiles';
import { Contract } from '../contracts';

const validateJobPayment = (job: Job, clientProfileId: number) => {
  if (job.paid) {
    throw new HandleException(
      HTTP_STATUS.UNPROCESSABLE.code,
      MESSAGES.JOB.ALREADY_PAID,
      HTTP_STATUS.UNPROCESSABLE.name
    );
  }

  if (job.contract.clientId !== clientProfileId) {
    throw new HandleException(
      HTTP_STATUS.FORBIDDEN.code,
      MESSAGES.JOB.NOT_YOUR_JOB,
      HTTP_STATUS.FORBIDDEN.name
    );
  }
};

const validateSufficientBalance = (client: Profile, jobPrice: number) => {
  if (client.balance < jobPrice) {
    throw new HandleException(
      HTTP_STATUS.UNPROCESSABLE.code,
      MESSAGES.PAYMENT.INSUFFICIENT_BALANCE,
      HTTP_STATUS.UNPROCESSABLE.name
    );
  }
};

export const jobsService = {
  async getUnpaidJobs(profileId: number) {
    const jobs = await jobsRepository.findUnpaidFromActiveContracts(profileId);
    return jobs.map(serializeJob);
  },

  async getTotalUnpaidForClient(clientId: number): Promise<number> {
    const jobs = await jobsRepository.findAllUnpaidForClient(clientId);
    return jobs.reduce((sum, job) => sum + Number(job.price), (0));
  },

  async payJob(jobId: number, clientProfileId: number, idempotencyKey: string) {
    return sequelize.transaction(async (t) => {
      const job = await jobsRepository.findByIdWithContractOrThrow(jobId, t);
      await job.reload({ include: [Contract], transaction: t });
      
      validateJobPayment(job, clientProfileId);

      const client = await profilesRepository.findByIdLockedOrThrow(clientProfileId, t);
      validateSufficientBalance(client, job.price);

      await profilesRepository.decrementBalance(clientProfileId, job.price, t);
      await profilesRepository.incrementBalance(job.contract.contractorId, job.price, t);
      await jobsRepository.markPaid(job, t);

      const result = serializeJob(job);

      await idempotencyRepository.create(
        idempotencyKey,
        'job_payment',
        jobId,
        { status: 'success', data: result },
        t
      );

      return result;
    });
  },
};
