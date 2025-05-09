import prisma from '../prisma.js';

export const getAll = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    res.json({ data: users });
  } catch (error) {
    console.error('Error in getAll users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ data: user });
  } catch (error) {
    console.error('Error in getById:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const create = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Note: In a real app, password should be hashed
        role,
        department,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });
    
    res.status(201).json({ data: newUser });
  } catch (error) {
    console.error('Error in create user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if email is already in use by another user
    if (email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email },
      });
      
      if (emailInUse) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        department,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });
    
    res.json({ data: updatedUser });
  } catch (error) {
    console.error('Error in update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await prisma.user.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error in delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}; 