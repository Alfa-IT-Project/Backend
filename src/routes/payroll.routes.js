import express from 'express';
import {
  createPayrollRecord,
  getPayrollRecords,
  getPayrollRecordById,
  updatePayrollRecord,
  approvePayrollRecord,
  markPayrollRecordAsPaid,
  getStaffPayroll,
  deletePayrollRecord
} from '../controllers/payroll.controller.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new payroll record (admin only)
router.post('/', isAdmin, createPayrollRecord);

// Get payroll records (all for admin, own for staff)
router.get('/', getPayrollRecords);

// Get staff-specific payroll records
router.get('/staff/:userId', getStaffPayroll);

// Get a specific payroll record by its ID
router.get('/:id', getPayrollRecordById);

// Update a payroll record (admin only)
router.put('/:id', isAdmin, updatePayrollRecord);

// Approve a payroll record (admin only)
router.post('/:id/approve', isAdmin, approvePayrollRecord);

// Mark a payroll record as paid (admin only)
router.post('/:id/paid', isAdmin, markPayrollRecordAsPaid);

// Delete a payroll record (admin only)
router.delete('/:id', isAdmin, deletePayrollRecord);

export default router; 