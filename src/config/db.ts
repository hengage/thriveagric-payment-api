import { Sequelize } from 'sequelize-typescript';
import { ENV } from './env';

export const sequelize = new Sequelize(ENV.DATABASE_URL, {
  dialect: 'postgres',
  models: [],
  logging: ENV.NODE_ENV !== 'test' ? console.log : false,
  pool: { max: 20, min: 2, acquire: 30000, idle: 10000 },
});