import { Router } from 'express';
import { contractsRouter } from '../domain/contracts';
import { jobsRouter } from '../domain/jobs';
import { profilesRouter } from '../domain/profiles';

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
  }
}
