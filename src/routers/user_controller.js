import express from 'express';
import {createUser, loginUser, authenticateToken} from '../service/user_management_service.js';
import {Prisma} from '@prisma/client';
import { UserAuthError } from '../utils/exeption.js';

const router = express.Router();

router.post('/register',async function(req, res, next) {
   try{
    const credientials = req.body;
    const result = await createUser(credientials);

    if(result) {
        res.send('User created successfully');
    }
   }catch(err){
       if (err instanceof Prisma.PrismaClientKnownRequestError){
           if(err.code === 'P2002'){
               res.status(400).send('User already exists');
           }
       }
   }
 
});

router.post('/login', async function(req, res, next) {
    try{
        const credientials = req.body;
        const token = await loginUser(credientials);
        if(token) {
            res.send({ token: token }); 
        }else{
            res.status(401).send('Invalid credientials');
        }
    }catch(err){
        res.status(500).send('Internal server error');
        console.log(err);
    }
});

// Protected route example
router.get('/protected', async function(req, res) {
    try{
        const token = req.headers['authorization']?.split(' ')[1];
        const result = await authenticateToken(token);

        if(result){
            res.send({ message: 'This is protected data', 
            userId: result.id });
        }

    }catch(err){
        if(err instanceof UserAuthError){
            res.status(401).send(err.message);
        }else{
            res.status(500).send('Internal server error');
        }
    }
   
});

export default router;