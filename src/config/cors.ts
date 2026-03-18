import { CorsOptions } from 'cors';
import { ENV } from './env';

const corsOptions: CorsOptions = {
  origin: ENV.ALLOWED_ORIGINS ? ENV.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    ...(ENV.ALLOWED_HEADERS
      ? ENV.ALLOWED_HEADERS.split(',').map((h) => h.trim())
      : []),
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export default corsOptions;