import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}

const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
  
      if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
      }
  
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: `Access denied. Role '${user.role}' is not allowed to access this route.`,
        });
      }
  
      next();
    };
  };

export default authMiddleware;
