import prisma from '../prisma.js';
import { PayrollStatus, Prisma } from '@prisma/client';

export const createPayrollRecord = async (req, res) => {
  try {
    const { userId, month, year, basicSalary, allowances, deductions } = req.body;

    // Validate required fields
    if (!userId || !month || !year || basicSalary === undefined || allowances === undefined || deductions === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert month and year to strings if they're numbers
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();

    // Validate month is between 1 and 12
    const monthNum = parseInt(monthStr);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid month value' });
    }

    // Validate year is reasonable
    const yearNum = parseInt(yearStr);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ error: 'Invalid year value' });
    }

    // Log received values for debugging
    console.log('Received payroll input:', { basicSalary, allowances, deductions });

    // Force number conversion
    const basicSalaryNum = Number(basicSalary);
    const allowancesNum = Number(allowances);
    const deductionsNum = Number(deductions);

    if (isNaN(basicSalaryNum) || isNaN(allowancesNum) || isNaN(deductionsNum)) {
      return res.status(400).json({ error: 'Invalid numeric values provided' });
    }

    // Convert to Decimal for calculations
    const baseSalaryDecimal = new Prisma.Decimal(basicSalaryNum);
    const allowancesDecimal = new Prisma.Decimal(allowancesNum);
    const deductionsDecimal = new Prisma.Decimal(deductionsNum);
    
    // Split allowances into overtime and bonus (60/40 split)
    const overtimePayDecimal = allowancesDecimal.mul(new Prisma.Decimal('0.6')).toDecimalPlaces(2);
    const bonusDecimal = allowancesDecimal.mul(new Prisma.Decimal('0.4')).toDecimalPlaces(2);

    // Calculate net salary using the split components for precision
    const netSalary = baseSalaryDecimal
      .add(overtimePayDecimal)
      .add(bonusDecimal)
      .sub(deductionsDecimal)
      .toDecimalPlaces(2);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for duplicate payroll record
    const existingRecord = await prisma.payrollRecord.findFirst({
      where: {
        userId,
        month: monthStr,
        year: yearStr,
      },
    });

    if (existingRecord) {
      return res.status(400).json({ error: 'Payroll record already exists for this month and year' });
    }

    // Create the record - note the field is baseSalary in the database, but the frontend sends basicSalary
    const record = await prisma.payrollRecord.create({
      data: {
        userId,
        month: monthStr,
        year: yearStr,
        // Map basicSalary from frontend to baseSalary in database
        baseSalary: baseSalaryDecimal.toDecimalPlaces(2).toNumber(),
        overtimePay: overtimePayDecimal.toDecimalPlaces(2).toNumber(),
        bonus: bonusDecimal.toDecimalPlaces(2).toNumber(),
        deductions: deductionsDecimal.toDecimalPlaces(2).toNumber(),
        netSalary: netSalary.toDecimalPlaces(2).toNumber(),
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

    // Transform the response to match frontend expectations
    const transformedRecord = {
      ...record,
      basicSalary: Number(record.baseSalary), // Map baseSalary back to basicSalary for frontend
      allowances: Number(record.overtimePay) + Number(record.bonus),
      deductions: Number(record.deductions),
      netSalary: Number(record.netSalary),
    };

    res.json(transformedRecord);
  } catch (error) {
    console.error('Error in createPayrollRecord:', error);
    // Provide more detailed error information
    if (error.code === 'P2002') {
      return res.status(400).json(
        { error: 'A payroll record already exists for this user, month, and year' }
      );
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid user ID provided' });
    }
    res.status(500).json({ 
      error: 'Failed to create payroll record',
      details: error.message || 'Unknown error occurred'
    });
  }
};

export const getPayrollRecords = async (req, res) => {
  try {
    const user = req.user;
    let records;

    if (user?.role === 'ADMIN') {
      records = await prisma.payrollRecord.findMany({
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      records = await prisma.payrollRecord.findMany({
        where: {
          userId: user?.id,
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Transform records to match frontend expectations
    const transformedRecords = records.map(record => (({
      ...record,

      // Map baseSalary to basicSalary for frontend
      basicSalary: Number(record.baseSalary),

      allowances: Number(record.overtimePay) + Number(record.bonus),
      deductions: Number(record.deductions),
      netSalary: Number(record.netSalary)
    })));

    res.json(transformedRecords);
  } catch (error) {
    console.error('Error in getPayrollRecords:', error);
    res.status(500).json({ error: 'Failed to fetch payroll records' });
  }
};

export const getStaffPayroll = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;

    // Check if the requesting user is either an admin or the staff member themselves
    if (requestingUser?.role !== 'ADMIN' && requestingUser?.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view these payroll records' });
    }

    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const records = await prisma.payrollRecord.findMany({
      where: {
        userId: userId,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform records to match frontend expectations
    const transformedRecords = records.map(record => (({
      ...record,

      // Map baseSalary to basicSalary for frontend
      basicSalary: Number(record.baseSalary),

      allowances: Number(record.overtimePay) + Number(record.bonus),
      deductions: Number(record.deductions),
      netSalary: Number(record.netSalary)
    })));

    res.json(transformedRecords);
  } catch (error) {
    console.error('Error in getStaffPayroll:', error);
    res.status(500).json({ error: 'Failed to fetch staff payroll records' });
  }
};

export const getPayrollRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Fetch payroll record
    const record = await prisma.payrollRecord.findUnique({
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

    if (!record) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Check if user has access (admins can see all, staff can only see their own)
    if (user?.role !== 'ADMIN' && record.userId !== user?.id) {
      return res.status(403).json({ error: 'Not authorized to view this payroll record' });
    }

    // Transform the record to match frontend expectations
    const transformedRecord = {
      ...record,
      basicSalary: Number(record.baseSalary), // Map baseSalary to basicSalary for frontend
      allowances: Number(record.overtimePay) + Number(record.bonus),
      deductions: Number(record.deductions),
      netSalary: Number(record.netSalary),
    };

    res.json(transformedRecord);
  } catch (error) {
    console.error('Error in getPayrollRecordById:', error);
    res.status(500).json({ error: 'Failed to fetch payroll record' });
  }
};

export const updatePayrollRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, basicSalary, allowances, deductions } = req.body;

    // First, check if record exists
    const existingRecord = await prisma.payrollRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Only allow updates if status is PENDING
    if (existingRecord.status !== PayrollStatus.PENDING) {
      return res.status(400).json({ error: 'Cannot update a payroll record that has been approved or paid' });
    }

    // Prepare update data
    const updateData = {};

    if (month !== undefined) {
      const monthStr = month.toString().padStart(2, '0');
      const monthNum = parseInt(monthStr);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ error: 'Invalid month value' });
      }
      updateData.month = monthStr;
    }

    if (year !== undefined) {
      const yearStr = year.toString();
      const yearNum = parseInt(yearStr);
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({ error: 'Invalid year value' });
      }
      updateData.year = yearStr;
    }

    // Log received values for debugging
    console.log('Received payroll update input:', { basicSalary, allowances, deductions });

    // Process the salary components
    let baseSalaryDecimal;
    let overtimePayDecimal;
    let bonusDecimal;
    let deductionsDecimal;
    let netSalaryDecimal;

    // If basicSalary is provided, update it
    if (basicSalary !== undefined) {
      const basicSalaryNum = Number(basicSalary);
      if (isNaN(basicSalaryNum) || basicSalaryNum < 0) {
        return res.status(400).json({ error: 'Invalid basic salary value' });
      }
      baseSalaryDecimal = new Prisma.Decimal(basicSalaryNum);
      updateData.baseSalary = baseSalaryDecimal.toNumber();
    } else {
      baseSalaryDecimal = new Prisma.Decimal(existingRecord.baseSalary.toString());
    }

    // If allowances is provided, update overtime and bonus
    if (allowances !== undefined) {
      const allowancesNum = Number(allowances);
      if (isNaN(allowancesNum) || allowancesNum < 0) {
        return res.status(400).json({ error: 'Invalid allowances value' });
      }
      const allowancesDecimal = new Prisma.Decimal(allowancesNum);
      overtimePayDecimal = allowancesDecimal.mul(new Prisma.Decimal('0.6')).toDecimalPlaces(2);
      bonusDecimal = allowancesDecimal.mul(new Prisma.Decimal('0.4')).toDecimalPlaces(2);
      updateData.overtimePay = overtimePayDecimal.toNumber();
      updateData.bonus = bonusDecimal.toNumber();
    } else {
      overtimePayDecimal = new Prisma.Decimal(existingRecord.overtimePay.toString());
      bonusDecimal = new Prisma.Decimal(existingRecord.bonus.toString());
    }

    // If deductions is provided, update it
    if (deductions !== undefined) {
      const deductionsNum = Number(deductions);
      if (isNaN(deductionsNum) || deductionsNum < 0) {
        return res.status(400).json({ error: 'Invalid deductions value' });
      }
      deductionsDecimal = new Prisma.Decimal(deductionsNum);
      updateData.deductions = deductionsDecimal.toNumber();
    } else {
      deductionsDecimal = new Prisma.Decimal(existingRecord.deductions.toString());
    }

    // Calculate netSalary
    const allowancesTotal = overtimePayDecimal.add(bonusDecimal);
    netSalaryDecimal = baseSalaryDecimal.add(allowancesTotal).sub(deductionsDecimal);
    updateData.netSalary = netSalaryDecimal.toNumber();

    // Update the record
    const record = await prisma.payrollRecord.update({
      where: { id },
      data: updateData,
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

    // Transform the record to match frontend expectations
    const transformedRecord = {
      ...record,
      basicSalary: Number(record.baseSalary),
      allowances: Number(record.overtimePay) + Number(record.bonus),
      deductions: Number(record.deductions),
      netSalary: Number(record.netSalary),
    };

    res.json(transformedRecord);
  } catch (error) {
    console.error('Error in updatePayrollRecord:', error);
    res.status(500).json({ error: 'Failed to update payroll record' });
  }
};

export const approvePayrollRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // First, check if record exists
    const existingRecord = await prisma.payrollRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Update the record status to APPROVED
    const record = await prisma.payrollRecord.update({
      where: { id },
      data: {
        status: PayrollStatus.APPROVED,
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

    // Transform the record to match frontend expectations
    const transformedRecord = {
      ...record,
      basicSalary: Number(record.baseSalary),
      allowances: Number(record.overtimePay) + Number(record.bonus),
      deductions: Number(record.deductions),
      netSalary: Number(record.netSalary),
    };

    res.json(transformedRecord);
  } catch (error) {
    console.error('Error in approvePayrollRecord:', error);
    res.status(500).json({ error: 'Failed to approve payroll record' });
  }
};

export const markPayrollRecordAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    // First, check if record exists
    const existingRecord = await prisma.payrollRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Update the record status to PAID and set paymentDate
    const record = await prisma.payrollRecord.update({
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

    // Transform the record to match frontend expectations
    const transformedRecord = {
      ...record,
      basicSalary: Number(record.baseSalary),
      allowances: Number(record.overtimePay) + Number(record.bonus),
      deductions: Number(record.deductions),
      netSalary: Number(record.netSalary),
    };

    res.json(transformedRecord);
  } catch (error) {
    console.error('Error in markPayrollRecordAsPaid:', error);
    res.status(500).json({ error: 'Failed to mark payroll record as paid' });
  }
};

export const deletePayrollRecord = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE request for payroll ID: ${id}`);

    // First, check if record exists
    const existingRecord = await prisma.payrollRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      console.log(`Payroll record not found with ID: ${id}`);
      return res.status(404).json({ error: `Payroll record not found with ID: ${id}` });
    }

    // Only allow deletion if status is not PAID
    if (existingRecord.status === PayrollStatus.PAID) {
      return res.status(400).json({ error: 'Cannot delete a payroll record that has been paid' });
    }

    // Delete the record
    await prisma.payrollRecord.delete({
      where: { id },
    });

    console.log(`Payroll record ${id} deleted successfully`);
    res.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    console.error('Error in deletePayrollRecord:', error);
    // Provide more detailed error information
    const errorMessage = error.message || 'Failed to delete payroll record';
    const errorCode = error.code || 'UNKNOWN_ERROR';
    res.status(500).json({ 
      error: 'Failed to delete payroll record',
      details: errorMessage,
      code: errorCode
    });
  }
}; 