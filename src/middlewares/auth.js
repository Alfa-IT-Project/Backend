import jwt from 'jsonwebtoken';
import { AppError } from './error.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Invalid token'));
    }
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }

      if (!roles.includes(req.user.role)) {
        throw new AppError(403, 'Not authorized - Insufficient permissions');
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError(500, 'Authorization failed'));
      }
    }
  };
};

export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized - Admin access required');
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Authorization failed'));
    }
  }
}; 