import express from 'express';
import { getEvaluations, createEvaluation, submitSelfReview } from '../controllers/performance.controller.js';
import { authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/performance:
 *   post:
 *     summary: Create a new performance review
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - rating
 *               - feedback
 *               - goals
 *               - strengths
 *               - areasForImprovement
 *             properties:
 *               userId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               feedback:
 *                 type: string
 *               goals:
 *                 type: string
 *               strengths:
 *                 type: array
 *                 items:
 *                   type: string
 *               areasForImprovement:
 *                 type: array
 *                 items:
 *                   type: string
 *               period:
 *                 type: string
 *                 pattern: '^\d{4}-Q[1-4]$'
 *     responses:
 *       201:
 *         description: Performance review created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authorize(['ADMIN']), createEvaluation);

/**
 * @swagger
 * /api/performance:
 *   get:
 *     summary: Get performance reviews
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of performance reviews
 *       401:
 *         description: Unauthorized
 */
router.get('/', getEvaluations);

/**
 * @swagger
 * /api/performance/self:
 *   post:
 *     summary: Submit self-review
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - feedback
 *               - goals
 *               - strengths
 *               - areasForImprovement
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               feedback:
 *                 type: string
 *               goals:
 *                 type: string
 *               strengths:
 *                 type: array
 *                 items:
 *                   type: string
 *               areasForImprovement:
 *                 type: array
 *                 items:
 *                   type: string
 *               period:
 *                 type: string
 *                 pattern: '^\d{4}-Q[1-4]$'
 *     responses:
 *       201:
 *         description: Self-review submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/self', submitSelfReview);

export default router; 