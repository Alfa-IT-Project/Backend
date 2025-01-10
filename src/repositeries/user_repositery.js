import {Prisma, PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();


async function saveUser(credientials) {
    try{
        const result = await prisma.user.create({
            data: {
                username : credientials.username,
                email: credientials.email,
                password: credientials.hashedPassword
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


export {saveUser, getUserByUsername};

