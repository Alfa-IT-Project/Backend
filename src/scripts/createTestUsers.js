import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'ADMIN',
    department: 'Management'
  },
  {
    name: 'HR Manager',
    email: 'hr@example.com',
    password: 'Hr@123',
    role: 'ADMIN',
    department: 'Human Resources'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'John@123',
    role: 'STAFF',
    department: 'Engineering'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Jane@123',
    role: 'STAFF',
    department: 'Marketing'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'Mike@123',
    role: 'STAFF',
    department: 'Sales'
  }
];

async function createTestUsers() {
  try {
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          department: user.department
        }
      });

      console.log(`Created user: ${user.name} (${user.email})`);
      console.log(`Login with: email=${user.email}, password=${user.password}`);
      console.log('---');
    }
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers(); 