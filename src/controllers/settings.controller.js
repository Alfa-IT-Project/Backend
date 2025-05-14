import prisma from '../prisma.js';
import { AppError } from '../middlewares/error.js';

export const getSettings = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await prisma.userSettings.create({
        data: {
          userId,
        },
      });
      return res.json(defaultSettings);
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const updatedSettings = req.body;
    
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: updatedSettings,
      create: {
        userId,
        ...updatedSettings,
      },
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
}; 