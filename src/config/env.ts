export enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL!,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
  DATABASE_SSL_MODE: process.env.DATABASE_SSL_MODE,
  DATABASE_SSL_ROOT_CERT: process.env.DATABASE_SSL_ROOT_CERT,
  NODE_ENV: (process.env.NODE_ENV ?? NodeEnv.DEVELOPMENT) as NodeEnv,
  PORT: Number(process.env.PORT ?? 3001),
  DEPOSIT_LIMIT_RATIO: Number(process.env.DEPOSIT_LIMIT_RATIO ?? 0.25),
  RATE_LIMIT_GENERAL: Number(process.env.RATE_LIMIT_GENERAL ?? 100),
  RATE_LIMIT_ANALYTICS: Number(process.env.RATE_LIMIT_ANALYTICS ?? 30),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  ALLOWED_HEADERS: process.env.ALLOWED_HEADERS,
} as const;

// Validate required vars at startup
const REQUIRED = ['DATABASE_URL', 'ALLOWED_HEADERS'] as const;
for (const key of REQUIRED) {
  if (!ENV[key]) throw new Error(`Missing required environment variable: ${key}`);
}