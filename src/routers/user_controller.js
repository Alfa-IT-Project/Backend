import express from 'express';
import {createUser, loginUser, authenticateToken} from '../service/user_management_service.js';
import {Prisma} from '@prisma/client';
import { UserAuthError } from '../utils/exeption.js';
import { getUserProfile } from '../repositeries/user_repositery.js';


const router = express.Router();

router.post('/register',async function(req, res, next) {
   try{
    const credentials = req.body;
    const result = await createUser(credentials);

    if(result) {
        res.send('User created successfully');
        console.log("User Profile Data:", result);
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
        const credentials = req.body;
        const token = await loginUser(credentials);
        if(token) {
            // return res.send({ token: token }); 
            res.json(token);  // Send back the token and userId
        }else{
            res.status(401).send('Invalid credentials');
        }
    }catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
        
    }
});

// Protected route for getting user profile
router.get('/:id/profile', authenticateToken(['customer', 'general_manager']), async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from token

        console.log("Authenticated User ID:", userId);  // Log for debugging

        // Fetch the user profile from the database
        const userProfile = await getUserProfile(userId);
        console.log("User Profile Data:", userProfile); // Debugging

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;