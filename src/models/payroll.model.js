import { prisma } from '../index';
import { PayrollStatus } from '@prisma/client';

export const createPayrollRecord = async data => {
  return prisma.payrollRecord.create({
    data: {
      ...data,
      status: PayrollStatus.PENDING,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          department: true,
        },
      },
    },
  });
};

export const getPayrollRecords = async () => {
  return prisma.payrollRecord.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          department: true,
        },
      },
    },
  });
};

export const getPayrollRecordById = async id => {
  return prisma.payrollRecord.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          department: true,
        },
      },
    },
  });
};

export const updatePayrollRecord = async (id, data) => {
  return prisma.payrollRecord.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          department: true,
        },
      },
    },
  });
};

export const approvePayrollRecord = async id => {
  return prisma.payrollRecord.update({
    where: { id },
    data: {
      status: PayrollStatus.APPROVED
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          department: true
        }
      }
    }
  });
};

export const markAsPaid = async id => {
  return prisma.payrollRecord.update({
    where: { id },
    data: {
      status: PayrollStatus.PAID,
      paymentDate: new Date(),
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          department: true,
        },
      },
    },
  });
}; 