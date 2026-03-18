import { sequelize } from '../config/db';
import '../domain/profiles/profile.model';
import '../domain/contracts/contract.model';
import '../domain/jobs/job.model';
import '../common/idempotency/idempotencyKey.model';

async function sync() {
  await sequelize.sync({ force: true });
  console.log('Database synced');
  await sequelize.close();
}

sync().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
