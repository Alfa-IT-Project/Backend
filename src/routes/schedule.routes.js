import express from 'express';
import { 
  createSchedule, 
  getSchedules, 
  updateSchedule, 
  requestSwap,
  updateSwapStatus,
  deleteSchedule,
  createBulkSchedules,
  getStaffAvailability
} from '../controllers/schedule.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Simple test route without authentication
router.get('/test', (req, res) => {
  res.json({ message: 'Schedules API is working!' });
});

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Get all schedules (filtered by user role)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Start date for filtering schedules
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: End date for filtering schedules
 *       - in: query
 *         name: departmentFilter
 *         schema:
 *           type: string
 *         description: Filter by department (admin only)
 *     responses:
 *       200:
 *         description: List of schedules
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getSchedules);

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
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
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               userId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               role:
 *                 type: string
 *               shiftType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize(['ADMIN']), createSchedule);

/**
 * @swagger
 * /api/schedules/bulk:
 *   post:
 *     summary: Create multiple schedules at once
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schedules
 *             properties:
 *               schedules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - userId
 *                     - date
 *                     - startTime
 *                     - endTime
 *                     - role
 *                     - shiftType
 *                   properties:
 *                     userId:
 *                       type: string
 *                     date:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *                     role:
 *                       type: string
 *                     shiftType:
 *                       type: string
 *     responses:
 *       201:
 *         description: Bulk schedules created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/bulk', authenticate, authorize(['ADMIN']), createBulkSchedules);

/**
 * @swagger
 * /api/schedules/availability:
 *   get:
 *     summary: Get staff availability for a specific date
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Date to check availability for
 *       - in: query
 *         name: departmentFilter
 *         schema:
 *           type: string
 *         description: Filter staff by department
 *     responses:
 *       200:
 *         description: Staff availability data
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/availability', getStaffAvailability);

/**
 * @swagger
 * /api/schedules/{id}:
 *   patch:
 *     summary: Update a schedule
 *     tags: [Schedules]
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
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               role:
 *                 type: string
 *               shiftType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Schedule not found
 */
router.patch('/:id', authenticate, authorize(['ADMIN']), updateSchedule);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     tags: [Schedules]
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
 *         description: Schedule deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Schedule not found
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteSchedule);

/**
 * @swagger
 * /api/schedules/swap:
 *   post:
 *     summary: Request a schedule swap
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requesterId
 *               - requestedWithId
 *               - originalEntryId
 *             properties:
 *               requesterId:
 *                 type: string
 *               requestedWithId:
 *                 type: string
 *               originalEntryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Swap request created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/swap', authenticate, requestSwap);

/**
 * @swagger
 * /api/schedules/swap/{id}:
 *   patch:
 *     summary: Update a swap request status
 *     tags: [Schedules]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Swap request updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Swap request not found
 */
router.patch('/swap/:id', authenticate, updateSwapStatus);

export default router; 