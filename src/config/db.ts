import { Sequelize } from "sequelize-typescript";
import { ENV, NodeEnv } from "./env";
import { Profile } from "../domain/profiles";
import { Contract } from "../domain/contracts";
import { Job } from "../domain/jobs";
import { IdempotencyKey } from "../common/idempotency";

const dbUrl =
  ENV.NODE_ENV === NodeEnv.TEST ? ENV.TEST_DATABASE_URL : ENV.DATABASE_URL;

const getSslConfig = () => {
  // 1. If SSL isn't required, turn it off immediately
  if (ENV.DATABASE_SSL_MODE !== 'require') {
    return false;
  }

  // 2. If SSL is required, check if we have a specific certificate
  if (ENV.DATABASE_SSL_ROOT_CERT) {
    return {
      ca: ENV.DATABASE_SSL_ROOT_CERT,
      rejectUnauthorized: true, // Strict mode: verified by CA
    };
  }

  // 3. SSL required but no cert provided - accept self-signed
  return {
    rejectUnauthorized: false,
  };
};

export const sequelize = new Sequelize(dbUrl!, {
  dialect: "postgres",
  models: [Profile, Contract, Job, IdempotencyKey],
  logging: false,
  pool: { max: 20, min: 2, acquire: 30000, idle: 10000 },
  dialectOptions: {
    ssl: getSslConfig(),
  },
});
