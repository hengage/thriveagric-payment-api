import request from 'supertest';
import { app } from '../../src/app';
import { ContractStatus, ProfileType } from '../../src/constants/enums';
import { Contract } from '../../src/domain/contracts';
import { Job } from '../../src/domain/jobs';
import { Profile } from '../../src/domain/profiles';
import { toMajorUnits, toMinorUnits } from '../../src/utils/money.utils';
import { MESSAGES } from '../../src/utils/messages';
import { HTTP_STATUS } from '../../src/constants/httpStatus';

describe('Jobs — payment', () => {
  let clientId: number;
  let contractorId: number;
  let jobId: number;
  const initialBalance = toMinorUnits(5000);
  const jobPrice = toMinorUnits(200);

  beforeAll(async () => {
    const client = await Profile.create({
      firstName: 'Test',
      lastName: 'Client',
      profession: 'Manager',
      balance: initialBalance,
      type: ProfileType.CLIENT,
    });

    const contractor = await Profile.create({
      firstName: 'Test',
      lastName: 'Contractor',
      profession: 'Engineer',
      balance: 0,
      type: ProfileType.CONTRACTOR,
    });

    const contract = await Contract.create({
      terms: 'Test contract',
      status: ContractStatus.IN_PROGRESS,
      clientId: client.id,
      contractorId: contractor.id,
    });

    const job = await Job.create({
      description: 'Test job',
      price: jobPrice,
      paid: false,
      contractId: contract.id,
    });

    clientId = client.id;
    contractorId = contractor.id;
    jobId = job.id;
  });

  it('first payment succeeds', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/pay`)
      .set('profile_id', String(clientId))
      .set('Idempotency-Key', `pay-job-${jobId}-attempt-1`);

    expect(res.status).toBe(HTTP_STATUS.OK.code);
    expect(res.body.status).toBe('success');
  });

  it('second payment on same job fails with 422', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/pay`)
      .set('profile_id', String(clientId))
      .set('Idempotency-Key', `pay-job-${jobId}-attempt-2`);

    expect(res.status).toBe(HTTP_STATUS.UNPROCESSABLE.code);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe(MESSAGES.JOB.ALREADY_PAID);
  });

  it('balances changed exactly once', async () => {
    const updatedClient = await Profile.findByPk(clientId);
    const updatedContractor = await Profile.findByPk(contractorId);

    expect(toMajorUnits(updatedClient!.balance)).toBe(toMajorUnits(initialBalance - jobPrice));
    expect(toMajorUnits(updatedContractor!.balance)).toBe(toMajorUnits(jobPrice));
  });

  it('job is marked paid with paymentDate', async () => {
    const updatedJob = await Job.findByPk(jobId);
    expect(updatedJob!.paid).toBe(true);
    expect(updatedJob!.paymentDate).not.toBeNull();
  });

  it('missing idempotency key returns 400', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/pay`)
      .set('profile_id', String(clientId));

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe(MESSAGES.IDEMPOTENCY.KEY_REQUIRED);
  });
});