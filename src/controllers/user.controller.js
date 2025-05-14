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
    console.log('User creation request body:', req.body);
    const { name, email, password, role, department } = req.body;
    
    if (!name || !email || !password || !role) {
      console.error('Missing required fields for user creation');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    
    // Generate a unique username by adding a timestamp if not provided
    let username = req.body.username;
    if (!username) {
      // Create a unique username by extracting the part before @ and adding a timestamp
      const emailPrefix = email.split('@')[0];
      const timestamp = Date.now();
      username = `${emailPrefix}_${timestamp}`;
    } else {
      // Check if the provided username already exists
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      
      if (existingUsername) {
        // Add timestamp to make it unique
        username = `${username}_${Date.now()}`;
      }
    }
    
    console.log('Using username:', username);
    
    // Ensure role is one of the valid enum values
    const validRoles = ['general_manager', 'customer', 'product_manager', 'delivery_manager', 'driver', 'supplier_manager', 'STAFF', 'ADMIN'];
    const normalizedRole = validRoles.includes(role) ? role : 'STAFF';
    
    try {
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          username,
          password,
          role: normalizedRole,
          department: department || null,
          // Ensure updatedAt is set
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          department: true,
          createdAt: true,
        },
      });
      
      console.log('User created successfully:', newUser);
      res.status(201).json({ data: newUser });
    } catch (prismaError) {
      console.error('Prisma error details:', prismaError);
      throw prismaError;
    }
  } catch (error) {
    console.error('Error in create user:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.meta) console.error('Error metadata:', error.meta);
    res.status(500).json({ error: 'Failed to create user: ' + error.message });
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