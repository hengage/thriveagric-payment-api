import { Sequelize } from "sequelize-typescript";
import { ENV, NodeEnv } from "./env";
import { Profile } from "../domain/profiles";
import { Contract } from "../domain/contracts";
import { Job } from "../domain/jobs";
import { IdempotencyKey } from "../common/idempotency";

const dbUrl =
  ENV.NODE_ENV === NodeEnv.TEST ? ENV.TEST_DATABASE_URL : ENV.DATABASE_URL;

export const sequelize = new Sequelize(dbUrl!, {
  dialect: "postgres",
  models: [Profile, Contract, Job, IdempotencyKey],
  logging: false,
  pool: { max: 20, min: 2, acquire: 30000, idle: 10000 },
});
