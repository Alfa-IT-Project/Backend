import prisma from '../prisma.js';
import { AppError } from '../middlewares/error.js';

export const getEvaluations = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const reviews = await prisma.performanceReview.findMany({
      where: isAdmin ? undefined : { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      }
    });

    res.json(reviews);
  } catch (error) {
    next(new AppError(500, 'Failed to fetch performance reviews'));
  }
};

export const createEvaluation = async (req, res, next) => {
  try {
    const { userId, rating, feedback, goals, strengths, areasForImprovement, period } = req.body;

    if (!userId || !rating || !feedback || !goals || !strengths || !areasForImprovement) {
      throw new AppError(400, 'Missing required fields');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new AppError(400, 'Rating must be between 1 and 5');
    }

    // Validate arrays
    if (!Array.isArray(strengths) || !Array.isArray(areasForImprovement)) {
      throw new AppError(400, 'Strengths and areas for improvement must be arrays');
    }

    if (strengths.length === 0 || areasForImprovement.length === 0) {
      throw new AppError(400, 'At least one strength and one area for improvement is required');
    }

    // Validate period format if provided
    if (period && !/^\d{4}-Q[1-4]$/.test(period)) {
      throw new AppError(400, 'Invalid period format. Use YYYY-Q format (e.g., 2024-Q1)');
    }

    const review = await prisma.performanceReview.create({
      data: {
        userId,
        rating,
        feedback,
        goals,
        strengths: strengths,
        areasForImprovement: areasForImprovement,
        period: period || `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
      }
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const submitSelfReview = async (req, res) => {
  try {
    const { period, rating, feedback, goals, strengths, areasForImprovement } = req.body;
    const userId = req.user?.id;

    const review = await prisma.performanceReview.create({
      data: {
        userId: userId,
        period,
        rating,
        feedback,
        goals,
        strengths: strengths,
        areasForImprovement: areasForImprovement
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error in submitSelfReview:', error);
    res.status(500).json({ error: 'Failed to submit self-review' });
  }
}; 