import express from 'express';
import { getAll, getById, create, update, remove } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Add a test route that doesn't require authentication for debugging
router.get('/test', async (req, res) => {
  try {
    const { prisma } = require('../index');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });
    
    res.json({ data: users });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// All routes require authentication
router.use(authenticate);

// Get all users
router.get('/', getAll);

// Get a single user by ID
router.get('/:id', getById);

// Create a new user
router.post('/', create);

// Update a user
router.put('/:id', update);

// Delete a user
router.delete('/:id', remove);

export default router; 