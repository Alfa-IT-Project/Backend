import prisma from '../prisma.js';

export const getLeaves = async (req, res) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const leaves = await prisma.leaveRequest.findMany({
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

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const createLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user?.id;

    const leave = await prisma.leaveRequest.create({
      data: {
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        userId: userId
      }
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, managerComment } = req.body;

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        managerComment
      }
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user?.id;

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        userId,
        status: 'APPROVED'
      }
    });

    // Calculate total days used for each leave type
    const calculateDaysUsed = (type) => {
      return leaves
        .filter((l) => l.type === type)
        .reduce((total, leave) => {
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
          return total + diffDays;
        }, 0);
    };

    const balance = {
      SICK: Math.max(0, 10 - calculateDaysUsed('SICK')),
      ANNUAL: Math.max(0, 20 - calculateDaysUsed('ANNUAL')),
      CASUAL: Math.max(0, 5 - calculateDaysUsed('CASUAL')),
      total: 35, // Total available days (10 + 20 + 5)
      used: calculateDaysUsed('SICK') + calculateDaysUsed('ANNUAL') + calculateDaysUsed('CASUAL'),
      remaining: 35 - (calculateDaysUsed('SICK') + calculateDaysUsed('ANNUAL') + calculateDaysUsed('CASUAL'))
    };

    res.json(balance);
  } catch (error) {
    console.error('Error getting leave balance:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    console.log('Cancel leave request:', { id, userId });

    // Find the leave request
    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    console.log('Found leave request:', leave);

    if (!leave) {
      console.log('Leave request not found');
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if the user is the owner of the leave request
    if (leave.userId !== userId) {
      console.log('User not authorized to cancel this leave request');
      return res.status(403).json({ message: 'Not authorized to cancel this leave request' });
    }

    // Check if the leave request is still pending
    if (leave.status !== 'PENDING') {
      console.log('Leave request is not pending:', leave.status);
      return res.status(400).json({ message: 'Only pending leave requests can be canceled' });
    }

    // Update the leave request status to REJECTED with a comment indicating it was canceled by the user
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        managerComment: 'Canceled by the user'
      },
    });

    console.log('Successfully updated leave request:', updatedLeave);
    res.json(updatedLeave);
  } catch (error) {
    console.error('Error in cancelLeave:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}; 