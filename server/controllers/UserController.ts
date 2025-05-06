// src/controllers/UserController.ts
import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import User, { UserRole } from '../models/User';
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

  public async deleteUserById(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const currentUser = (req as any).user;
      let isUserToDelete = false;

      const userToDelete = await User.findById({ _id: id });
      if (userToDelete?.role === UserRole.Manager && currentUser.role === UserRole.Admin) {
        return res.status(200).json({ message: 'You are not authorize to delete this user' });
      }

      if (userToDelete?.role === UserRole.Owner && currentUser.role === UserRole.Admin) {
        isUserToDelete = true;
      }

      if (userToDelete?.role === UserRole.Manager && currentUser.role === UserRole.Owner) {
        isUserToDelete = true;
      }

      if (isUserToDelete) {
        const result = await User.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
          this.errorResponse(res, 404, 'User not found');
          return;
        }
      }

      res.status(200).json({ message: 'User deleted successfully', currentUser, userToDelete, isUserToDelete });

      // this.jsonResponse(res, 200, 'Users deleted successfully', currentUser);
    } catch (error) {
      this.errorResponse(res, 500, 'Failed to retrieve users', error);
    }
  }

  public async createUser(req: Request, res: Response): Promise<any> {
    try {
      // Your business logic here
      const { name, email, password, role } = req.body;
      const currentUser = (req as any).user;

      console.log('currentUser', currentUser);

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return this.jsonResponse(res, 200, 'User already exists', existingUser);
      }

      // const allUsers = await User.find();
      // const userId = allUsers.length + 1; // Simulated user ID generation

      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const newUser = new User({ name, email, password: hashedPassword, role });

      // Apply creator link logic
      if (role === UserRole.Owner && currentUser.role === UserRole.Admin) {
        newUser.createdBy = currentUser._id;
      }

      if (role === UserRole.Manager && currentUser.role === UserRole.Owner) {
        newUser.createdBy = currentUser._id;
      }

      await newUser.save();

      if (!process.env.SECRET_KEY) {
        throw new Error('SECRET_KEY is not defined in environment variables');
      }

      const token = jwt.sign({ _id: newUser._id, role: newUser.role }, process.env.SECRET_KEY, { expiresIn: '2h' });

      res.status(201).json({
        message: 'User created successfully',
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        token,
      });

    } catch (error) {
      this.errorResponse(res, 400, 'Failed to create user', error);
    }
  }

  public async loginUser(req: Request, res: Response): Promise<any> {
    try {
      // Your business logic here
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      if (!process.env.SECRET_KEY) {
        throw new Error('SECRET_KEY is not defined in environment variables');
      }

      const token = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '24h' });
      res.status(200).json({ message: 'Login Successful', _id: user._id, email: user.email, role: user.role, token });

      // if (user) {
      //   const isMatch = await bcrypt.compare(password, user.password);
      //   if (!isMatch) {
      //     this.jsonResponse(res, 200, 'Invalid credentials');
      //     return;
      //   }

      //   if (!process.env.SECRET_KEY) {
      //     throw new Error('SECRET_KEY is not defined in environment variables');
      //   }
      //   const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '2h' });

      //   // res.status(200).json({ message: 'Login Successful', token, user });
      //   this.jsonResponse(res, 201, 'Login Successful', { token, user });

      // }
      // else {
      //   this.jsonResponse(res, 201, 'User not exists');
      // }

    } catch (error) {
      this.errorResponse(res, 400, 'Failed user login', error);
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;

      if (!userId) {
        this.errorResponse(res, 404, 'User not found');
        return;
      }

      // Simulated user data
      const user = await User.findOne({ _id: userId });

      this.jsonResponse(res, 200, 'User found', user);
    } catch (error) {
      this.errorResponse(res, 500, 'Internal server error', error);
    }
  }

}