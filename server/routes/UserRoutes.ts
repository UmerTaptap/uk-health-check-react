// src/routes/UserRoutes.ts
import { UserController } from '../controllers/UserController';
import { BaseRoute } from './BaseRoute';
import authMiddleware from '../../server/middleware/authMiddleware';

export class UserRoutes extends BaseRoute<UserController> {
  constructor(controller: UserController) {
    // Mandatory super() call with controller
    super(controller);
  }

  protected registerRoutes(): void {
    // Properly initialized router available here
    this.router.get('/users/all', authMiddleware, (req, res) => 
      this.controller.getAllUsers(req, res)
    );
    
    this.router.post('/users/signup', (req, res) => 
      this.controller.createUser(req, res)
    );

    this.router.post('/users/login', (req, res) => 
      this.controller.loginUser(req, res)
    );

    this.router.get('/users/:id', authMiddleware, (req, res) =>
      this.controller.getUserById(req, res)
    );

    this.router.post('/users/delete', authMiddleware, (req, res) =>
      this.controller.deleteUsers(req, res)
    );

    this.router.post('/users/delete/:id', authMiddleware, (req, res) =>
      this.controller.deleteUserById(req, res)
    );
  }
}