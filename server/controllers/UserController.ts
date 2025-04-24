// src/controllers/UserController.ts
import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import User from '../models/User'; // Adjust the import path as necessary

export class UserController extends BaseController {
  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      // Simulated data
      const users = await User.find();
      if(users.length === 0) {
        this.errorResponse(res, 404, 'No users found');
        return;
      }

      
      this.jsonResponse(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
      this.errorResponse(res, 500, 'Failed to retrieve users', error);
    }
  }

  public async deleteUsers(req: Request, res: Response): Promise<void> {
    try {
      // Simulated data
      const result = await User.deleteMany({});
      console.log(`Deleted ${result.deletedCount} users.`);

      
      this.jsonResponse(res, 200, 'Users deleted successfully', result);
    } catch (error) {
      this.errorResponse(res, 500, 'Failed to retrieve users', error);
    }
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Your business logic here
      this.jsonResponse(res, 201, 'User created successfully');
    } catch (error) {
      this.errorResponse(res, 400, 'Failed to create user', error);
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      
      if (!userId) {
         this.errorResponse(res, 404, 'User not found');
      }

      // Simulated user data
      const user = { id: userId, name: 'John Doe' };
      this.jsonResponse(res, 200, 'User found', user);
    } catch (error) {
      this.errorResponse(res, 500, 'Internal server error', error);
    }
  }
}