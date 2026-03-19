import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { Routes } from './routes';
import { sequelize } from './config/db';
import corsOptions from './config/cors';
import { ENV, NodeEnv } from './config/env';
import { notFound, errorHandler } from './middleware';

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
const routes = new Routes();
app.use('/api', routes.router);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);


async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    app.listen(ENV.PORT, () => {
      console.log(`Server running on port ${ENV.PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to database:', err);
    process.exit(1);
  }
}

if (ENV.NODE_ENV !== NodeEnv.TEST) {
  bootstrap();
}

export { app };
