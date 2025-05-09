import rateLimit from 'express-rate-limit';
import { AppError } from './error.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 20 : 5, // More attempts in development
  message: 'Too many login attempts, please try again later',
  handler: (req, res) => {
    throw new AppError(429, 'Too many requests, please try again later');
  }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 200 : 100, // More requests in development
  message: 'Too many requests, please try again later',
  handler: (req, res) => {
    throw new AppError(429, 'Too many requests, please try again later');
  }
});

export { authLimiter, apiLimiter }; 