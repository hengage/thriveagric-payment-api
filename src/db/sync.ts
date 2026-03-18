import { sequelize } from '../config/db';

async function sync() {
  await sequelize.sync();
  console.log('Database synced');
  await sequelize.close();
}

sync().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
