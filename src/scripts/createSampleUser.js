import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createSampleUser() {
  try {
    // Create a password that meets requirements (minimum 6 characters)
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    // Check if user already exists by username
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (existingUserByEmail) {
      console.log('User with email admin@example.com already exists. Try using these credentials to log in.');
      return;
    }
    
    // If username exists, use a different username
    const username = existingUserByUsername ? 'adminuser' : 'admin';
    
    // Create user with valid email format
    const user = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        username: username,
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Management'
      }
    });

    console.log('Sample user created successfully:');
    console.log('Email: admin@example.com');
    console.log('Username: ' + username);
    console.log('Password: password123');
    console.log('User details:', {
      id: user.id,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Error creating sample user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleUser(); 