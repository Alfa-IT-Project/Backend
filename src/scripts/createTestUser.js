import { prisma } from '../index';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'IT'
      }
    });

    console.log('Test user created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 