import { validationResult, body } from 'express-validator';
import { AppError } from './error.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new AppError(400, errorMessages.join(', '));
  }
  next();
};

export const validateEmail = [
  body('email').isEmail().withMessage('Invalid email format'),
  validateRequest
];

export const validateLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateRequest
];

export const validateRegister = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['STAFF', 'ADMIN']).withMessage('Invalid role')
];

export const validateLeaveRequest = [
  body('type').isIn(['SICK', 'ANNUAL', 'CASUAL']).withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Invalid start date format'),
  body('endDate').isISO8601().withMessage('Invalid end date format'),
  body('reason').notEmpty().withMessage('Reason is required')
];

export const validatePayroll = [
  body('month').isISO8601().withMessage('Invalid month format'),
  body('userIds').isArray().withMessage('User IDs must be an array'),
  body('userIds.*').isUUID().withMessage('Invalid user ID format')
];

export const validatePerformance = [
  body('period').matches(/^\d{4}-Q[1-4]$/).withMessage('Invalid period format. Use YYYY-Q format (e.g., 2024-Q1)'),
  body('scores').isObject().withMessage('Scores must be an object'),
  body('scores.attendance').isFloat({ min: 0, max: 100 }).withMessage('Attendance score must be between 0 and 100'),
  body('scores.teamwork').isFloat({ min: 0, max: 100 }).withMessage('Teamwork score must be between 0 and 100'),
  body('scores.communication').isFloat({ min: 0, max: 100 }).withMessage('Communication score must be between 0 and 100'),
  body('scores.productivity').isFloat({ min: 0, max: 100 }).withMessage('Productivity score must be between 0 and 100'),
  body('scores.goals').isFloat({ min: 0, max: 100 }).withMessage('Goals score must be between 0 and 100'),
  body('comments').notEmpty().withMessage('Comments are required')
];

export const validateSchedule = [
  body('date').isISO8601().withMessage('Invalid date format'),
  body('startTime').isISO8601().withMessage('Invalid start time format'),
  body('endTime').isISO8601().withMessage('Invalid end time format'),
  body('role').notEmpty().withMessage('Role is required'),
  body('shiftType').notEmpty().withMessage('Shift type is required')
];

export const validateAttendance = [
  body('location').optional().isString().withMessage('Location must be a string')
]; 