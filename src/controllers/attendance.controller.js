import prisma from '../prisma.js';
import { AppError } from '../middlewares/error.js';
import { sendOTP } from '../utils/otp.js';

export const getAttendance = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const attendance = await prisma.attendance.findMany({
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

    res.json(attendance);
  } catch (error) {
    next(new AppError(500, 'Failed to fetch attendance records'));
  }
};

export const getAttendanceRecords = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';

    console.log('[getAttendanceRecords] Request params:', { userId, startDate, endDate });
    console.log('[getAttendanceRecords] User:', req.user);

    // Build filter conditions
    const where = {};

    // If not admin, only show own records unless explicitly requested
    if (!isAdmin) {
      where.userId = req.user?.id;
    } else if (userId) {
      where.userId = userId;
    }

    // Date filtering
    if (startDate || endDate) {
      where.date = {};

      if (startDate) {
        where.date.gte = new Date(startDate);
      }

      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        where.date.lte = endDateObj;
      }
    }

    console.log(
      '[getAttendanceRecords] Query where clause:',
      JSON.stringify(where, null, 2)
    );

    const records = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`[getAttendanceRecords] Found ${records.length} records`);
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    next(new AppError(500, 'Failed to fetch attendance records'));
  }
};

export const getPendingOTPs = async (req, res, next) => {
  try {
    console.log('[getPendingOTPs] Request user:', req.user);

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is a manager/admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    console.log('[getPendingOTPs] User role:', user?.role);

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    // Get all pending OTPs that haven't expired and haven't been used
    console.log('[getPendingOTPs] Querying database for OTPs');

    const otps = await prisma.oTP.findMany({
      where: {
        expiresAt: { gt: new Date() },
        used: false
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[getPendingOTPs] Found ${otps.length} OTPs`);

    // Map to match the expected frontend structure
    const mappedOtps = otps.map(otp => ({
      id: otp.id,
      userId: otp.userId,
      otp: otp.otp,
      type: otp.type,
      expiresAt: otp.expiresAt.toISOString(),
      user: {
        name: otp.user.name,
        email: otp.user.email,
        department: otp.user.department || ''
      }
    }));

    res.json(mappedOtps);
  } catch (error) {
    console.error('Error fetching pending OTPs:', error);
    next(new AppError(500, 'Failed to fetch pending OTPs'));
  }
};

export const clockIn = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { location } = req.body;

    if (!userId) {
      throw new AppError(401, 'User not authenticated');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: today
      }
    });

    if (existingAttendance) {
      throw new AppError(400, 'Already clocked in today');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Find an admin to send the OTP to
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      throw new AppError(404, 'No admin found to verify attendance');
    }

    // Store OTP in database
    await prisma.oTP.create({
      data: {
        userId,
        otp,
        type: 'CLOCK_IN',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
        used: false
      }
    });

    // Send response without creating attendance record
    res.status(200).json({
      message: 'OTP generated successfully. Please enter the OTP to complete clock in.'
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to clock in'));
    }
  }
};

export const verifyClockIn = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { otp } = req.body;

    if (!userId) {
      throw new AppError(401, 'User not authenticated');
    }

    // Find and validate OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        userId,
        otp,
        type: 'CLOCK_IN',
        expiresAt: { gt: new Date() },
        used: false
      }
    });

    if (!otpRecord) {
      throw new AppError(400, 'Invalid or expired OTP');
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create attendance record after OTP verification
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: today,
        clockInTime: new Date(),
        status: 'ON_TIME',
        location: req.body.location || 'Office'
      }
    });

    res.status(201).json(attendance);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to verify clock in'));
    }
  }
};

export const clockOut = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    console.log(`[clockOut] Request from user ID: ${userId}`);

    if (!userId) {
      throw new AppError(401, 'User not authenticated');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's attendance record
    console.log(
      `[clockOut] Searching for attendance record for user ${userId} on ${today.toISOString()}`
    );
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: today,
        clockOutTime: null
      }
    });

    console.log(`[clockOut] Found attendance record:`, attendance);

    if (!attendance) {
      // If no record with clockOutTime = null is found, check if there's any record for today at all
      const anyRecord = await prisma.attendance.findFirst({
        where: {
          userId,
          date: today
        }
      });

      console.log(`[clockOut] Any record found for today:`, anyRecord);

      if (anyRecord) {
        // If record exists but already has clockOutTime
        if (anyRecord.clockOutTime) {
          throw new AppError(400, 'Already clocked out today');
        }

        // If record exists with clockInTime but clockOutTime is undefined (not null)
        // This handles the case where the record might have been created with clockOutTime = undefined
        if (anyRecord.clockInTime) {
          // Update the record to ensure clockOutTime is explicitly null
          await prisma.attendance.update({
            where: { id: anyRecord.id },
            data: { clockOutTime: null }
          });

          // Proceed with clock out flow using this record
          try {
            // Generate OTP for clock out verification
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Find an admin to send the OTP to
            console.log('[clockOut] Finding admin user to send OTP');
            const admin = await prisma.user.findFirst({
              where: { role: 'ADMIN' }
            });

            console.log('[clockOut] Admin user found:', admin);

            // Store OTP in database
            await prisma.oTP.create({
              data: {
                userId,
                otp,
                type: 'CLOCK_OUT',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
                used: false
              }
            });

            // Try to send OTP to admin if available
            if (admin && admin.email) {
              try {
                await sendOTP(admin.email, otp);
                console.log(`[clockOut] OTP sent to admin: ${admin.email}`);
              } catch (emailError) {
                console.error(`[clockOut] Failed to send OTP email:`, emailError);
                // Continue without throwing - we'll show the OTP in the console for testing
                console.log(`[clockOut] TEST MODE - OTP for ${userId}: ${otp}`);
              }
            } else {
              console.log('[clockOut] No admin found, using TEST MODE');
              console.log(`[clockOut] TEST MODE - OTP for ${userId}: ${otp}`);
            }

            // Send response
            return res.status(200).json({
              message: 'OTP generated successfully. Please enter the OTP to complete clock out.'
            });
          } catch (otpError) {
            console.error('[clockOut] Error during OTP generation/sending:', otpError);
            throw new AppError(500, 'Failed to generate OTP');
          }
        }
      }

      throw new AppError(400, 'No active clock-in found for today. Please clock in first.');
    }

    try {
      // Generate OTP for clock out verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Find an admin to send the OTP to
      console.log('[clockOut] Finding admin user to send OTP');
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      
      console.log('[clockOut] Admin user found:', admin);

      // Store OTP in database
      await prisma.oTP.create({
        data: {
          userId,
          otp,
          type: 'CLOCK_OUT',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
          used: false
        }
      });
      
      // Try to send OTP to admin if available
      if (admin && admin.email) {
        try {
          await sendOTP(admin.email, otp);
          console.log(`[clockOut] OTP sent to admin: ${admin.email}`);
        } catch (emailError) {
          console.error(`[clockOut] Failed to send OTP email:`, emailError);
          // Continue without throwing - we'll show the OTP in the console for testing
          console.log(`[clockOut] TEST MODE - OTP for ${userId}: ${otp}`);
        }
      } else {
        console.log('[clockOut] No admin found, using TEST MODE');
        console.log(`[clockOut] TEST MODE - OTP for ${userId}: ${otp}`);
      }

      // Send response without updating attendance record
      res.status(200).json({
        message: 'OTP generated successfully. Please enter the OTP to complete clock out.'
      });
    } catch (otpError) {
      console.error('[clockOut] Error during OTP generation/sending:', otpError);
      throw new AppError(500, 'Failed to generate OTP');
    }
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      console.error('[clockOut] Unexpected error:', error);
      next(new AppError(500, 'Failed to clock out'));
    }
  }
};

export const verifyClockOut = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { otp } = req.body;
    
    console.log(`[verifyClockOut] Verifying OTP for user ${userId}, OTP: ${otp}`);

    if (!userId) {
      throw new AppError(401, 'User not authenticated');
    }

    // Find and validate OTP
    console.log(`[verifyClockOut] Finding OTP record for user ${userId}`);
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        userId,
        otp,
        type: 'CLOCK_OUT',
        expiresAt: { gt: new Date() },
        used: false
      }
    });
    
    console.log(`[verifyClockOut] OTP record found:`, otpRecord);

    if (!otpRecord) {
      console.log(`[verifyClockOut] Invalid or expired OTP for user ${userId}`);
      throw new AppError(400, 'Invalid or expired OTP');
    }

    // Mark OTP as used
    console.log(`[verifyClockOut] Marking OTP as used: ${otpRecord.id}`);
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    console.log(
      `[verifyClockOut] Finding attendance record for user ${userId} on ${today}`
    );
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: today,
        clockOutTime: null
      }
    });
    
    console.log(`[verifyClockOut] Attendance record found:`, attendance);

    if (!attendance) {
      console.log(`[verifyClockOut] No active clock-in record found for user ${userId}`);
      throw new AppError(404, 'No active clock-in record found');
    }

    // Update attendance record with clock out time
    const now = new Date();
    console.log(`[verifyClockOut] Updating attendance record with clock out time: ${now}`);
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOutTime: now
      }
    });
    
    console.log(
      `[verifyClockOut] Successfully updated attendance record:`,
      updatedAttendance
    );

    res.status(201).json(updatedAttendance);
  } catch (error) {
    console.error(`[verifyClockOut] Error:`, error);
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to verify clock out'));
    }
  }
};
