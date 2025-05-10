import prisma from '../prisma.js';
import { AppError } from '../middlewares/error.js';

// Simplified getSchedules function that returns mock data for testing
export const getSchedules = async (req, res, next) => {
  try {
    // Extract query parameters
    const { startDate, endDate, userId, departmentFilter } = req.query;

    // Log the request for debugging
    console.log('GET /api/schedules', { startDate, endDate, userId, departmentFilter });

    // Build the where clause based on provided filters
    let where = {};
    
    // Date filters
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate)
      };
    }

    // User filter
    if (userId) {
      where.userId = userId;
    }

    // Department filter - we need to filter users by department first
    let userIds;
    if (departmentFilter) {
      const usersInDepartment = await prisma.user.findMany({
        where: {
          department: departmentFilter
        },
        select: {
          id: true
        }
      });
      
      userIds = usersInDepartment.map(user => user.id);
      
      if (userIds.length > 0) {
        where.userId = { in: userIds };
      } else {
        // No users found in this department, return empty array
        return res.json([]);
      }
    }

    // Query the database
    const schedules = await prisma.scheduleEntry.findMany({
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
        date: 'asc'
      }
    });

    res.json(schedules);
  } catch (error) {
    console.error('Error in getSchedules:', error);
    next(new AppError(500, 'Failed to fetch schedules'));
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const { userId, date, startTime, endTime, role, shiftType } = req.body;

    if (!userId || !date || !startTime || !endTime || !role || !shiftType) {
      throw new AppError(400, 'Missing required fields');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new AppError(400, 'Start time must be before end time');
    }

    // Check for scheduling conflicts
    const existingSchedule = await prisma.scheduleEntry.findFirst({
      where: {
        userId,
        date: new Date(date),
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ]
      }
    });

    if (existingSchedule) {
      throw new AppError(400, 'Employee already has a conflicting schedule for this time');
    }

    // Check for leave conflicts
    const leaveConflict = await prisma.leaveRequest.findFirst({
      where: {
        userId,
        status: 'APPROVED',
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(date) } },
              { endDate: { gte: new Date(date) } }
            ]
          }
        ]
      }
    });

    if (leaveConflict) {
      throw new AppError(400, 'Employee is on approved leave for this date');
    }

    const schedule = await prisma.scheduleEntry.create({
      data: {
        userId,
        date: new Date(date),
        startTime: start,
        endTime: end,
        role,
        shiftType
      }
    });

    res.status(201).json(schedule);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to create schedule'));
    }
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, role, shiftType } = req.body;

    const existingSchedule = await prisma.scheduleEntry.findUnique({
      where: { id }
    });

    if (!existingSchedule) {
      throw new AppError(404, 'Schedule not found');
    }

    const start = startTime ? new Date(startTime) : existingSchedule.startTime;
    const end = endTime ? new Date(endTime) : existingSchedule.endTime;
    const scheduleDate = date ? new Date(date) : existingSchedule.date;

    if (start >= end) {
      throw new AppError(400, 'Start time must be before end time');
    }

    // Check for scheduling conflicts
    if (startTime || endTime || date) {
      const conflictingSchedule = await prisma.scheduleEntry.findFirst({
        where: {
          userId: existingSchedule.userId,
          date: scheduleDate,
          id: { not: id },
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } }
              ]
            },
            {
              AND: [
                { startTime: { lt: end } },
                { endTime: { gte: end } }
              ]
            },
            {
              AND: [
                { startTime: { gte: start } },
                { endTime: { lte: end } }
              ]
            }
          ]
        }
      });

      if (conflictingSchedule) {
        throw new AppError(400, 'Employee already has a conflicting schedule for this time');
      }

      // Check for leave conflicts
      const leaveConflict = await prisma.leaveRequest.findFirst({
        where: {
          userId: existingSchedule.userId,
          status: 'APPROVED',
          OR: [
            {
              AND: [
                { startDate: { lte: scheduleDate } },
                { endDate: { gte: scheduleDate } }
              ]
            }
          ]
        }
      });

      if (leaveConflict) {
        throw new AppError(400, 'Employee is on approved leave for this date');
      }
    }

    const schedule = await prisma.scheduleEntry.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        role,
        shiftType
      }
    });

    res.json(schedule);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to update schedule'));
    }
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingSchedule = await prisma.scheduleEntry.findUnique({
      where: { id }
    });

    if (!existingSchedule) {
      throw new AppError(404, 'Schedule not found');
    }

    await prisma.scheduleEntry.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to delete schedule'));
    }
  }
};

export const createBulkSchedules = async (req, res, next) => {
  try {
    const { schedules } = req.body;

    if (!Array.isArray(schedules) || schedules.length === 0) {
      throw new AppError(400, 'Invalid schedules data');
    }

    const results = {
      successful: 0,
      failed: 0,
      conflicts: []
    };

    for (const schedule of schedules) {
      const { userId, date, startTime, endTime, role, shiftType } = schedule;

      if (!userId || !date || !startTime || !endTime || !role || !shiftType) {
        results.failed++;
        results.conflicts.push({
          userId,
          date,
          reason: 'Missing required fields'
        });
        continue;
      }

      const start = new Date(startTime);
      const end = new Date(endTime);
      const scheduleDate = new Date(date);

      if (start >= end) {
        results.failed++;
        results.conflicts.push({
          userId,
          date,
          reason: 'Start time must be before end time'
        });
        continue;
      }

      // Check for scheduling conflicts
      const existingSchedule = await prisma.scheduleEntry.findFirst({
        where: {
          userId,
          date: scheduleDate,
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } }
              ]
            },
            {
              AND: [
                { startTime: { lt: end } },
                { endTime: { gte: end } }
              ]
            },
            {
              AND: [
                { startTime: { gte: start } },
                { endTime: { lte: end } }
              ]
            }
          ]
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });

      if (existingSchedule) {
        results.failed++;
        results.conflicts.push({
          userId,
          date,
          userName: existingSchedule.user?.name,
          reason: 'Conflicting schedule exists'
        });
        continue;
      }

      // Check for leave conflicts
      const leaveConflict = await prisma.leaveRequest.findFirst({
        where: {
          userId,
          status: 'APPROVED',
          OR: [
            {
              AND: [
                { startDate: { lte: scheduleDate } },
                { endDate: { gte: scheduleDate } }
              ]
            }
          ]
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });

      if (leaveConflict) {
        results.failed++;
        results.conflicts.push({
          userId,
          date,
          userName: leaveConflict.user?.name,
          reason: 'Employee on approved leave'
        });
        continue;
      }

      try {
        await prisma.scheduleEntry.create({
          data: {
            userId,
            date: scheduleDate,
            startTime: start,
            endTime: end,
            role,
            shiftType
          }
        });
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.conflicts.push({
          userId,
          date,
          reason: 'Database error'
        });
      }
    }

    res.status(201).json(results);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to create bulk schedules'));
    }
  }
};

// Get staff availability for a specific date
export const getStaffAvailability = async (req, res, next) => {
  try {
    // Extract query parameters
    const { date, departmentFilter } = req.query;

    if (!date) {
      throw new AppError(400, 'Date is required');
    }

    // Log the request for debugging
    console.log('GET /api/schedules/availability', { date, departmentFilter });

    // Convert date string to Date objects for the entire day
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Build the where clause for users based on department
    let userWhere = {
      role: 'STAFF'
    };

    if (departmentFilter) {
      userWhere.department = departmentFilter;
    }

    // Get all staff members
    const staff = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        email: true,
        department: true
      }
    });

    // Get all schedules for the specified date
    const schedules = await prisma.scheduleEntry.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        userId: {
          in: staff.map(user => user.id)
        }
      }
    });

    // Get all approved leave requests for the date
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
        userId: {
          in: staff.map(user => user.id)
        }
      }
    });

    // Prepare the availability data
    const staffAvailability = staff.map(user => {
      // Find schedules for this user
      const userSchedules = schedules.filter(schedule => schedule.userId === user.id);
      
      // Check if user has approved leave for this date
      const onLeave = leaves.some(leave => leave.userId === user.id);
      
      // User is scheduled if they have any schedules for this date
      const isScheduled = userSchedules.length > 0;
      
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        department: user.department || 'No Department',
        isAvailable: !isScheduled && !onLeave,
        isScheduled: isScheduled,
        onLeave,
        schedules: userSchedules
      };
    });

    res.json(staffAvailability);
  } catch (error) {
    console.error('Error in getStaffAvailability:', error);
    next(new AppError(500, 'Failed to fetch staff availability'));
  }
};

export const requestSwap = async (req, res, next) => {
  try {
    const { requesterId, requestedWithId, originalEntryId } = req.body;

    if (!requesterId || !requestedWithId || !originalEntryId) {
      throw new AppError(400, 'Missing required fields');
    }

    // Check if the original schedule entry exists
    const originalEntry = await prisma.scheduleEntry.findUnique({
      where: { id: originalEntryId }
    });

    if (!originalEntry) {
      throw new AppError(404, 'Original schedule not found');
    }

    // Create the swap request
    const swapRequest = await prisma.swapRequest.create({
      data: {
        requesterId,
        requestedWithId,
        originalEntryId
      }
    });

    res.status(201).json(swapRequest);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to create swap request'));
    }
  }
};

export const updateSwapStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      throw new AppError(400, 'Invalid status');
    }

    const existingRequest = await prisma.swapRequest.findUnique({
      where: { id },
      include: {
        originalEntry: true
      }
    });

    if (!existingRequest) {
      throw new AppError(404, 'Swap request not found');
    }

    const updatedRequest = await prisma.swapRequest.update({
      where: { id },
      data: { status }
    });

    if (status === 'APPROVED') {
      // Update the schedule entry to reflect the swap
      await prisma.scheduleEntry.update({
        where: { id: existingRequest.originalEntryId },
        data: { userId: existingRequest.requestedWithId }
      });
      
      // Create a new schedule entry for the original user if needed
      // This logic can be customized based on your business requirements
    }

    res.json(updatedRequest);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to update swap request'));
    }
  }
}; 