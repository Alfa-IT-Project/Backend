import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma.js';

// Import middlewares
import { errorHandler } from './middlewares/error.js';
import { authenticate } from './middlewares/auth.js';
import { requestLogger, errorLogger } from './middlewares/logger.js';
import { authLimiter, apiLimiter } from './middlewares/rateLimit.js';
import { swaggerDocs } from './middlewares/swagger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import performanceRoutes from './routes/performance.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import userRoutes from './routes/user.routes.js';
import reportRouters from './routers/report_controller.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', authenticate, leaveRoutes);
app.use('/api/payroll', authenticate, payrollRoutes);
app.use('/api/performance', authenticate, performanceRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attendance', authenticate, attendanceRoutes);
app.use('/api/settings', authenticate, settingsRoutes);
app.use('/api/reports', reportRouters);

// Add a test route that doesn't require authentication
app.get('/api/test-users', async (req, res) => {
  try {
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

// Swagger documentation
swaggerDocs(app);

// Error handling
app.use(errorLogger);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT ||4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 