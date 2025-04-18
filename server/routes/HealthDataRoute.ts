// routes/HealthDataRoute.ts
import { Router } from 'express';
import { HealthDataController } from '../controllers/HealthDataController';
import { BaseRoute } from './BaseRoute';

export class HealthDataRoute extends BaseRoute<HealthDataController> {
  constructor(controller: HealthDataController) {
    super(controller);
  }

  protected registerRoutes(): void {
    this.router.get('/health-data/:areaCode', (req, res) => 
      this.controller.getCachedHealthData(req, res)
    );
  }
}