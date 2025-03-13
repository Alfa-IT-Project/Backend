import {Prisma, PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();


async function saveUser(credentials) {
    try{
        const result = await prisma.user.create({
            data: {
                username : credentials.username,
                email: credentials.email,
                password: credentials.hashedPassword
            }
        })
      return result;
    }
    catch(err){
        throw err;
    }
}

async function getUserByUsername(username) {
    try{
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })
        return user;
    }
    catch(err){
        throw err;
    }       
    
}

async function getUserProfile(userId) {
    try {
        console.log(`getUserProfile called with userId: ${userId}`);
        const user = await prisma.user.findUnique({
            where: { id:userId }, 
            select: {
                username: true,
                email: true,
                role: true,
                created_at: true, // Assuming createdAt is the column name
            },
        });
        
        console.log(`getUserProfile query result:`, user);
        return user; // Return user data if found
    } catch (err) {
        throw err;
    }
}



export {saveUser, getUserByUsername, getUserProfile};

