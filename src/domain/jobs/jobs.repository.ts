import { Op } from 'sequelize';
import { Transaction } from 'sequelize';
import { Job } from './job.model';
import { Contract } from '../contracts/contract.model';
import { ContractStatus } from '../../constants/enums';
import { HandleException } from '../../utils/handleException.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';

export const jobsRepository = {
  async findUnpaidFromActiveContracts(profileId: number): Promise<Job[]> {
    return Job.findAll({
      where: { paid: false },
      include: [{
        model: Contract,
        where: {
          status: ContractStatus.IN_PROGRESS,
          [Op.or]: [{ clientId: profileId }, { contractorId: profileId }],
        },
      }],
    });
  },

  async findAllUnpaidForClient(clientId: number): Promise<Job[]> {
    return Job.findAll({
      where: { paid: false },
      include: [{
        model: Contract,
        where: {
          status: ContractStatus.IN_PROGRESS,
          clientId,
        },
      }],
    });
  },

  async findByIdWithContractOrThrow(jobId: number, t?: Transaction): Promise<Job> {
    const job = await Job.findOne({
      where: { id: jobId },
      include: [{ model: Contract, required: true }],
      ...(t && { lock: t.LOCK.UPDATE, transaction: t }),
    });
    if (!job) {
      throw new HandleException(
        HTTP_STATUS.NOT_FOUND.code,
        MESSAGES.JOB.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND.name
      );
    }
    return job;
  },

  async markPaid(job: Job, t: Transaction): Promise<void> {
    await job.update({ paid: true, paymentDate: new Date() }, { transaction: t });
  },
};
