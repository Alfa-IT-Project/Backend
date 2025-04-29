import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Save a new contact message
export const saveContactMessage = async (data) => {
  return await prisma.contactMessage.create({ data });
};

// Get all contact messages (for admin panel)
export const getAllContactMessages = async () => {
  return await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
};
