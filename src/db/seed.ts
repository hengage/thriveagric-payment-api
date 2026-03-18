import 'dotenv/config';
import { sequelize } from '../config/db';
import { Profile } from '../domain/profiles';
import { Contract } from '../domain/contracts';
import { Job } from '../domain/jobs';
import { ProfileType, ContractStatus } from '../constants/enums';
import { toMinorUnits } from '../utils/money.utils';

async function seed() {
  await sequelize.sync();

  // Profiles
  const [client1] = await Profile.findOrCreate({
    where: { firstName: 'Emeka', lastName: 'Okafor' },
    defaults: {
      profession: 'Product Manager',
      balance: toMinorUnits(1500),
      type: ProfileType.CLIENT,
    },
  });

  const [client2] = await Profile.findOrCreate({
    where: { firstName: 'Aisha', lastName: 'Bello' },
    defaults: {
      profession: 'Designer',
      balance: toMinorUnits(500),
      type: ProfileType.CLIENT,
    },
  });

  const [contractor1] = await Profile.findOrCreate({
    where: { firstName: 'Tunde', lastName: 'Adeyemi' },
    defaults: {
      profession: 'Backend Engineer',
      balance: toMinorUnits(0),
      type: ProfileType.CONTRACTOR,
    },
  });

  // Contracts
  const [contract1] = await Contract.findOrCreate({
    where: { clientId: client1.id, contractorId: contractor1.id, status: ContractStatus.IN_PROGRESS },
    defaults: {
      terms: 'Build payment API for freelance platform',
    },
  });

  const [contract2] = await Contract.findOrCreate({
    where: { clientId: client2.id, contractorId: contractor1.id, status: ContractStatus.IN_PROGRESS },
    defaults: {
      terms: 'Design landing page mockups',
    },
  });

  await Contract.findOrCreate({
    where: { clientId: client1.id, contractorId: contractor1.id, status: ContractStatus.TERMINATED },
    defaults: {
      terms: 'Old project — already wrapped up',
    },
  });

  // Jobs
  await Job.findOrCreate({
    where: { description: 'Set up Express + Sequelize project structure', contractId: contract1.id },
    defaults: { price: toMinorUnits(200), paid: false },
  });

  await Job.findOrCreate({
    where: { description: 'Implement auth middleware', contractId: contract1.id },
    defaults: { price: toMinorUnits(150), paid: false },
  });

  await Job.findOrCreate({
    where: { description: 'Build payment endpoint with pessimistic locking', contractId: contract1.id },
    defaults: { price: toMinorUnits(300), paid: true, paymentDate: new Date('2024-06-01') },
  });

  await Job.findOrCreate({
    where: { description: 'Design homepage mockup', contractId: contract2.id },
    defaults: { price: toMinorUnits(250), paid: false },
  });

  console.log('Seed complete');
  console.log('');
  console.log('Test profiles:');
  console.log(`  Client 1    → profile_id: ${client1.id}  (balance: ₦1,500)`);
  console.log(`  Client 2    → profile_id: ${client2.id}  (balance: ₦500)`);
  console.log(`  Contractor  → profile_id: ${contractor1.id} (balance: ₦0)`);

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
