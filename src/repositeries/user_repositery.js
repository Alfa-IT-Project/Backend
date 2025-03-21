import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();


async function saveUser(credentials) {
    try{
        const result = await prisma.user.create({
            data: {
                username : credentials.username,
                password: credentials.hashedPassword,
                name: credentials.name, 
                email: credentials.email,
                phone:credentials.phone,
                address:credentials.address,
                role: credentials.role,
                customer: {
                    create: {} 
                }
            }
        })
        console.log(`saveUser query result:`, result);
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
                name: true,
                email: true,
                phone: true,
                address: true,
                role: true,
                customer: {
                    select: {
                        notes: true,
                    },
                }
            },
        });
        
       // console.log(`getUserProfile query result:`, user);
        return user; // Return user data if found
    } catch (err) {
        throw err;
    }
}

export {saveUser, getUserByUsername, getUserProfile};

