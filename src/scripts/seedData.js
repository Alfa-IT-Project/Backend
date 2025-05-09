import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Function to generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Function to subtract days from a date
const subtractDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

async function main() {
  console.log('Starting seed script...');

  // First, clear existing test data
  console.log('Clearing existing test data...');
  await prisma.oTP.deleteMany({});
  await prisma.attendance.deleteMany({});
  console.log('Existing test data cleared');

  // Get all users
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log('No users found. Please create users first.');
    return;
  }

  console.log(`Found ${users.length} users`);

  // Create pending OTPs for users
  for (const user of users) {
    // Create clock-in OTP
    const clockInOtp = generateOTP();
    await prisma.oTP.create({
      data: {
        userId: user.id,
        otp: clockInOtp,
        type: 'CLOCK_IN',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
        createdAt: new Date(),
      }
    });
    console.log(`Created CLOCK_IN OTP ${clockInOtp} for user ${user.name}`);

    // Create clock-out OTP
    const clockOutOtp = generateOTP();
    await prisma.oTP.create({
      data: {
        userId: user.id,
        otp: clockOutOtp,
        type: 'CLOCK_OUT',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
        createdAt: new Date(),
      }
    });
    console.log(`Created CLOCK_OUT OTP ${clockOutOtp} for user ${user.name}`);
  }

  // Create attendance records for the past week
  // Current date but forcing year to be 2024
  const today = new Date();
  today.setFullYear(2024);
  
  for (const user of users) {
    // Create attendance records for the past 7 days
    for (let i = 1; i <= 7; i++) {
      const date = subtractDays(today, i);
      date.setHours(0, 0, 0, 0);
      
      const clockInTime = new Date(date);
      clockInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0); // Random clock-in between 9:00 and 9:30
      
      const randomValue = Math.random();
      let status;
      
      if (randomValue < 0.7) {
        status = "ON_TIME";
      } else if (randomValue < 0.9) {
        status = "LATE";
      } else {
        status = "ABSENT";
      }

      let attendanceData = {
        userId: user.id,
        date: date,
        status: status,
        clockInTime: status !== 'ABSENT' ? clockInTime : null,
      };

      // Add clock-out time if not absent
      if (status !== 'ABSENT') {
        const clockOutTime = new Date(date);
        clockOutTime.setHours(17, Math.floor(Math.random() * 30), 0, 0); // Random clock-out between 17:00 and 17:30
        attendanceData.clockOutTime = clockOutTime;
      }

      // Create attendance record
      await prisma.attendance.create({
        data: attendanceData
      });
      
      console.log(
        `Created attendance record for ${user.name} on ${date.toISOString().split('T')[0]} with status ${status}`
      );
    }
  }

  console.log('Seed script completed successfully');
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 