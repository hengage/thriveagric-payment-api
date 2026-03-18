import { Router } from 'express';
import { contractsRouter } from '../domain/contracts';
import { jobsRouter } from '../domain/jobs';
import { profilesRouter } from '../domain/profiles';
import { adminRouter } from '../domain/admin';

export class Routes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use('/contracts', contractsRouter);
    this.router.use('/jobs', jobsRouter);
    this.router.use('/balances', profilesRouter);
    this.router.use('/admin', adminRouter);
  }
}
