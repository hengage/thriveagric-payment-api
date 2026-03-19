import request from 'supertest';
import { app } from '../../src/app';
import { sequelize } from '../../src/config/db';
import { ContractStatus, ProfileType } from '../../src/constants/enums';
import { Contract } from '../../src/domain/contracts';
import { Profile } from '../../src/domain/profiles';
import { MESSAGES } from '../../src/utils/messages';

describe('Auth — contract visibility', () => {
  let clientId: number;
  let contractorId: number;
  let strangerId: number;
  let contractId: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const client = await Profile.create({
      firstName: 'Client',
      lastName: 'User',
      profession: 'Manager',
      balance: 0,
      type: ProfileType.CLIENT,
    });

    const contractor = await Profile.create({
      firstName: 'Contractor',
      lastName: 'User',
      profession: 'Engineer',
      balance: 0,
      type: ProfileType.CONTRACTOR,
    });

    const stranger = await Profile.create({
      firstName: 'Stranger',
      lastName: 'User',
      profession: 'Designer',
      balance: 0,
      type: ProfileType.CLIENT,
    });

    const contract = await Contract.create({
      terms: 'Test contract',
      status: ContractStatus.IN_PROGRESS,
      clientId: client.id,
      contractorId: contractor.id,
    });

    clientId = client.id;
    contractorId = contractor.id;
    strangerId = stranger.id;
    contractId = contract.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('client can view their own contract', async () => {
    const res = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('profile_id', String(clientId));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(contractId);
  });

  it('contractor can view their own contract', async () => {
    const res = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('profile_id', String(contractorId));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(contractId);
  });

  it('stranger gets 404 — does not leak resource existence', async () => {
    const res = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('profile_id', String(strangerId));

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  it('missing profile_id header returns 401', async () => {
    const res = await request(app)
      .get(`/api/contracts/${contractId}`);

    expect(res.status).toBe(401);
  });

  it('non-numeric profile_id returns 400', async () => {
    const res = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('profile_id', 'abc');

    expect(res.status).toBe(400);
  });
});