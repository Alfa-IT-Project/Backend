import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeZone:
 *                 type: string
 *               dateFormat:
 *                 type: string
 *               emailNotifications:
 *                 type: boolean
 *               leaveRequestNotifications:
 *                 type: boolean
 *               scheduleChangeNotifications:
 *                 type: boolean
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/', authenticate, updateSettings);

export default router; 