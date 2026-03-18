import { Job } from '../domain/jobs';
import { toMajorUnits } from './money.utils';

export const serializeJob = (job: Job) => {
  const jobData = job.get({ plain: true });
  return {
    ...jobData,
    price: toMajorUnits(BigInt(jobData.price)),
    ...(job.contract && {
      contract: job.contract.get({ plain: true }),
    }),
  };
};
