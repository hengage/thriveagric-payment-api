import { Sequelize } from 'sequelize-typescript';
import { ENV } from './env';
import { Profile } from '../domain/profiles';
import { Contract } from '../domain/contracts';
import { Job } from '../domain/jobs';

export const sequelize = new Sequelize(ENV.DATABASE_URL, {
  dialect: 'postgres',
  models: [Profile, Contract, Job],
  logging: ENV.NODE_ENV !== 'test' ? console.log : false,
  pool: { max: 20, min: 2, acquire: 30000, idle: 10000 },
});