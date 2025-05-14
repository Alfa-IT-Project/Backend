import express from 'express';
import { getLeaves, createLeave, updateLeaveStatus, getLeaveBalance, cancelLeave } from '../controllers/leave.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateLeaveRequest } from '../middlewares/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Create a new leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *               - type
 *               - reason
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [ANNUAL, SICK, MATERNITY, PATERNITY, UNPAID]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave request created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validateLeaveRequest, createLeave);

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Get all leave requests
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: List of leave requests
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getLeaves);

/**
 * @swagger
 * /api/leaves/balance:
 *   get:
 *     summary: Get leave balance
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/balance', authenticate, getLeaveBalance);

/**
 * @swagger
 * /api/leaves/{id}/cancel:
 *   put:
 *     summary: Cancel a pending leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave request canceled successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Leave request not found
 */
router.put('/:id/cancel', authenticate, cancelLeave);

/**
 * @swagger
 * /api/leaves/{id}:
 *   put:
 *     summary: Update a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave request updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Leave request not found
 */
router.put('/:id', authenticate, authorize(['ADMIN']), updateLeaveStatus);

export default router; 