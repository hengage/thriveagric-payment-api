import { Sequelize } from "sequelize-typescript";
import { ENV, NodeEnv } from "./env";
import { Profile } from "../domain/profiles";
import { Contract } from "../domain/contracts";
import { Job } from "../domain/jobs";
import { IdempotencyKey } from "../common/idempotency";

const dbUrl =
  ENV.NODE_ENV === NodeEnv.TEST ? ENV.TEST_DATABASE_URL : ENV.DATABASE_URL;

const getSslConfig = () => {
  // In production, always enable SSL
  if (ENV.NODE_ENV === NodeEnv.PRODUCTION) {
    // If we have a specific certificate, use strict mode
    if (ENV.DATABASE_SSL_ROOT_CERT) {
      return {
        ca: ENV.DATABASE_SSL_ROOT_CERT.replace(/\\n/g, '\n'),
        rejectUnauthorized: true,
      };
    }
    // Otherwise accept self-signed certs
    return {
      rejectUnauthorized: false,
    };
  }

  // In development/test, check if SSL is explicitly required
  if (ENV.DATABASE_SSL_MODE === 'require') {
    return {
      rejectUnauthorized: false,
    };
  }

  // Default: no SSL
  return false;
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
