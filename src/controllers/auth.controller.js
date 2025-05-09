import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/error.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (credentials) => {
  const { email, password } = credentials;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user.id, id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
};

export const register = async (userData) => {
  const { email, password, name, role } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError(400, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role
    }
  });

  const token = jwt.sign(
    { userId: user.id, id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
}; 