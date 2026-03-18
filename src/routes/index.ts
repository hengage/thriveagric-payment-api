import { Router } from 'express';
import { contractsRouter } from '../domain/contracts';

export class Routes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use('/contracts', contractsRouter);
  }
}
