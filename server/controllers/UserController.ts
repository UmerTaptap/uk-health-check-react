// src/controllers/UserController.ts
import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserController extends BaseController {
  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      // Simulated data
      const users = await User.find();
      if (users.length === 0) {
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

  public async deleteUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await User.deleteOne({ userId: id });
      if (result.deletedCount === 0) {
        this.errorResponse(res, 404, 'User not found');
        return;
      }

      console.log(`User Deleted ${result.deletedCount} Successfully.`);


      this.jsonResponse(res, 200, 'Users deleted successfully', result);
    } catch (error) {
      this.errorResponse(res, 500, 'Failed to retrieve users', error);
    }
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Your business logic here
      const { name, email, password } = req.body;

      const user = await User.findOne({ email });
      if (user) {
        this.jsonResponse(res, 200, 'User already exists', user);
        return;
      }

      const allUsers = await User.find();
      const userId = allUsers.length + 1; // Simulated user ID generation

      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const newUser = new User({ userId, name, email, password: hashedPassword });
      await newUser.save();

      this.jsonResponse(res, 201, 'User created successfully', newUser);
    } catch (error) {
      this.errorResponse(res, 400, 'Failed to create user', error);
    }
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    try {
      // Your business logic here
      const { name, email, password } = req.body;

      const user = await User.findOne({ email });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          this.errorResponse(res, 400, 'Invalid credentials');
          return;
        }

        if (!process.env.SECRET_KEY) {
          throw new Error('SECRET_KEY is not defined in environment variables');
        }
        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

        // res.status(200).json({ message: 'Login Successful', token, user });
        this.jsonResponse(res, 201, 'Login Successful', { token, user });

      }
      else {
        this.jsonResponse(res, 201, 'User not exists');
      }

    } catch (error) {
      this.errorResponse(res, 400, 'Failed user login', error);
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