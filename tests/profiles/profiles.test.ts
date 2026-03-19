import request from 'supertest';
import { app } from '../../src/app';
import { ContractStatus, ProfileType } from '../../src/constants/enums';
import { Contract } from '../../src/domain/contracts';
import { Job } from '../../src/domain/jobs';
import { Profile } from '../../src/domain/profiles';
import { toMinorUnits } from '../../src/utils/money.utils';
import { MESSAGES } from '../../src/utils/messages';

describe('Profiles — deposit', () => {
  let clientId: number;
  let contractorId: number;

  beforeAll(async () => {
    const client = await Profile.create({
      firstName: 'Deposit',
      lastName: 'Client',
      profession: 'Manager',
      balance: 0,
      type: ProfileType.CLIENT,
    });

    const contractor = await Profile.create({
      firstName: 'Deposit',
      lastName: 'Contractor',
      profession: 'Engineer',
      balance: 0,
      type: ProfileType.CONTRACTOR,
    });

    const contract = await Contract.create({
      terms: 'Deposit test contract',
      status: ContractStatus.IN_PROGRESS,
      clientId: client.id,
      contractorId: contractor.id,
    });

    // Create unpaid jobs totalling ₦400 — 25% limit = ₦100
    await Job.create({
      description: 'Job A',
      price: toMinorUnits(200),
      paid: false,
      contractId: contract.id,
    });

    await Job.create({
      description: 'Job B',
      price: toMinorUnits(200),
      paid: false,
      contractId: contract.id,
    });

    clientId = client.id;
    contractorId = contractor.id;
  });

  it('deposit within 25% limit succeeds', async () => {
    const res = await request(app)
      .post(`/api/balances/deposit/${clientId}`)
      .set('profile_id', String(clientId))
      .set('Idempotency-Key', `deposit-${Date.now()}`)
      .send({ amount: 100 }); // exactly 25% of ₦400

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('deposit exceeding 25% limit returns 400', async () => {
    const res = await request(app)
      .post(`/api/balances/deposit/${clientId}`)
      .set('profile_id', String(clientId))
      .set('Idempotency-Key', `deposit-exceed-${Date.now()}`)
      .send({ amount: 200 }); // 50% — over the limit

    expect(res.status).toBe(422);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toContain('exceeds');
  });

  it('contractor cannot make a deposit', async () => {
    const res = await request(app)
      .post(`/api/balances/deposit/${contractorId}`)
      .set('profile_id', String(contractorId))
      .set('Idempotency-Key', `deposit-contractor-${Date.now()}`)
      .send({ amount: 50 });
    console.log({response: res})

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe(MESSAGES.AUTH.FORBIDDEN_DEPOSIT);
  });
});