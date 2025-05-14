import express from 'express';
import { 
  getAttendance, 
  clockIn, 
  clockOut,
  getPendingOTPs,
  getAttendanceRecords,
  verifyClockIn,
  verifyClockOut
} from '../controllers/attendance.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/attendance/clock-in:
 *   post:
 *     summary: Clock in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Clocked in successfully
 *       400:
 *         description: Already clocked in today
 *       401:
 *         description: Unauthorized
 */
router.post('/clock-in', authenticate, clockIn);

/**
 * @swagger
 * /api/attendance/verify-clock-in:
 *   post:
 *     summary: Verify OTP and complete the clock in process
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: OTP code to verify
 *     responses:
 *       201:
 *         description: Clock in successfully completed
 *       400:
 *         description: Invalid or expired OTP
 *       401:
 *         description: Unauthorized
 */
router.post('/verify-clock-in', authenticate, verifyClockIn);

/**
 * @swagger
 * /api/attendance/clock-out:
 *   post:
 *     summary: Clock out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clocked out successfully
 *       400:
 *         description: No active clock-in found
 *       401:
 *         description: Unauthorized
 */
router.post('/clock-out', authenticate, clockOut);

/**
 * @swagger
 * /api/attendance/verify-clock-out:
 *   post:
 *     summary: Verify OTP and complete the clock out process
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: OTP code to verify
 *     responses:
 *       200:
 *         description: Clock out successfully completed
 *       400:
 *         description: Invalid or expired OTP
 *       401:
 *         description: Unauthorized
 */
router.post('/verify-clock-out', authenticate, verifyClockOut);

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of attendance records
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getAttendance);

/**
 * @swagger
 * /api/attendance/pending-otps:
 *   get:
 *     summary: Get pending OTPs (Admin/Manager only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending OTPs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not an admin/manager
 */
router.get('/pending-otps', authenticate, getPendingOTPs);

/**
 * @swagger
 * /api/attendance/records:
 *   get:
 *     summary: Get attendance records with filtering
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of attendance records
 *       401:
 *         description: Unauthorized
 */
router.get('/records', authenticate, getAttendanceRecords);

export default router; 