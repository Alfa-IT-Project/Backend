import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMIN,
      department: 'Management'
    }
  });
  console.log('Created admin user:', admin);

  // Create staff members
  const staffPassword = await bcrypt.hash('staff123', 10);
  const departments = ['IT', 'HR', 'Finance', 'Operations'];
  
  for (let i = 0; i < departments.length; i++) {
    const staff = await prisma.user.create({
      data: {
        name: `Staff Member ${i + 1}`,
        email: `staff${i + 1}@example.com`,
        password: staffPassword,
        role: Role.STAFF,
        department: departments[i]
      }
    });
    console.log('Created staff member:', staff);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 