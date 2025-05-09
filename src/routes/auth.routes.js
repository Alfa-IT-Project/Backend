import express from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { isAdmin } from '../middlewares/auth.js';
import { AppError } from '../middlewares/error.js';
import { validateLogin, validateRegister } from '../middlewares/validation.js';

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
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
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

export default router; 