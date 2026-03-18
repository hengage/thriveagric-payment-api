import { Profile } from '../domain/profiles';

declare global {
  namespace Express {
    interface Request {
      profile: Profile;
      idempotencyKey?: string;
    }
  }
}