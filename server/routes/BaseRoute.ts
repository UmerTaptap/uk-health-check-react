// src/routes/BaseRoute.ts
import { Router } from 'express';
import { BaseController } from '../controllers/BaseController';

export abstract class BaseRoute<T extends BaseController> {
  protected router: Router;
  protected controller: T;

  constructor(controller: T) {
    // Initialize router first
    this.router = Router();
    this.controller = controller;
    
    // Configure routes after initialization
    this.registerRoutes();
  }

  protected abstract registerRoutes(): void;

  public getRouter(): Router {
    return this.router;
  }
}