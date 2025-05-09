import prisma from '../prisma.js';
import { AppError } from '../middlewares/error.js';

export const getSchedules = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    const { startDate, endDate, departmentFilter, userId: queryUserId } = req.query;

    let whereClause = isAdmin ? {} : { userId };
    
    if (queryUserId && isAdmin) {
      whereClause.userId = queryUserId;
    }
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (departmentFilter && isAdmin) {
      whereClause.user = {
        department: departmentFilter
      };
    }

    const schedules = await prisma.scheduleEntry.findMany({
      where: whereClause,
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

export const getStaffAvailability = async (req, res, next) => {
  try {
    const { date, departmentFilter } = req.query;
    
    if (!date) {
      throw new AppError(400, 'Date is required');
    }

    const queryDate = new Date(date);
    
    // Get all staff members
    let whereClause = { role: 'STAFF' };
    
    if (departmentFilter) {
      whereClause.department = departmentFilter;
    }
    
    const staffMembers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        department: true,
        email: true
      }
    });

    // Get scheduled staff for that date
    const scheduledStaff = await prisma.scheduleEntry.findMany({
      where: {
        date: queryDate
      },
      select: {
        userId: true,
        startTime: true,
        endTime: true,
        shiftType: true
      }
    });

    // Get staff on leave for that date
    const staffOnLeave = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        startDate: {
          lte: queryDate
        },
        endDate: {
          gte: queryDate
        }
      },
      select: {
        userId: true,
        type: true
      }
    });

    // Map availability data
    const availabilityData = staffMembers.map(staff => {
      const schedule = scheduledStaff.find(s => s.userId === staff.id);
      const leaveInfo = staffOnLeave.find(l => l.userId === staff.id);
      
      return {
        ...staff,
        status: leaveInfo ? 'ON_LEAVE' : schedule ? 'SCHEDULED' : 'AVAILABLE',
        leaveType: leaveInfo?.type || null,
        scheduledTime: schedule ? {
          start: schedule.startTime,
          end: schedule.endTime,
          shiftType: schedule.shiftType
        } : null
      };
    });

    res.json(availabilityData);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, 'Failed to fetch staff availability'));
    }
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