import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createStaffUser() {
  try {
    // Create a password that meets requirements (minimum 6 characters)
    const password = 'staff123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a unique email and username
    const email = 'staff@example.com';
    const username = 'staffuser';
    
    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });
    
    // Check if user already exists by username
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUserByEmail) {
      console.log(`User with email ${email} already exists. Try using these credentials to log in.`);
      return;
    }
    
    if (existingUserByUsername) {
      console.log(`User with username ${username} already exists. Try using a different username.`);
      return;
    }
    
    // Create user with valid email format
    const user = await prisma.user.create({
      data: {
        name: 'Staff User',
        email,
        username,
        password: hashedPassword,
        role: 'STAFF',
        department: 'IT'
      }
    });

    console.log('Staff user created successfully:');
    console.log(`Email: ${email}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('User details:', {
      id: user.id,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Error creating staff user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStaffUser(); 