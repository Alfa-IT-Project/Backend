import express from 'express';
import { login, register, validateUser } from '../controllers/auth.controller.js';
import { isAdmin } from '../middlewares/auth.js';
import { AppError } from '../middlewares/error.js';
import { validateLogin, validateRegister, validateEmail } from '../middlewares/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Login failed'));
    }
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 */
router.post('/register', isAdmin, validateRegister, async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Registration failed'));
    }
  }
});

/**
 * @swagger
 * /api/auth/validate:
 *   post:
 *     summary: Validate if user exists
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: User exists
 *       404:
 *         description: User not found
 */
router.post('/validate', async (req, res, next) => {
  try {
    const { username } = req.body;
    console.log('Validate user request for username:', username);
    const result = await validateUser(username);
    console.log('Validation result:', result);
    res.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Validation failed'));
    }
  }
});

export default router; 