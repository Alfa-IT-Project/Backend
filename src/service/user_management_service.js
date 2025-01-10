import {saveUser, getUserByUsername} from '../repositeries/user_repositery.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserAuthError } from '../utils/exeption.js';

async function createUser(credientials) {
   try{
    const {username, email, password} = credientials;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await saveUser({username, email, hashedPassword});
    return result;
   }
    catch(err){
        throw err;
    }
}

async function loginUser(credientials) {
    try{
        const {username, password} = credientials;
        const user = await getUserByUsername(username);
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(isPasswordValid){
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return token;
        }
        
    }
    catch(err){
        throw err;
    }
}


function authenticateToken(token) {
    try{
        if (!token){
            throw new UserAuthError('Token not found');
        } 
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        return decodedToken;
    }catch(err){
        throw new UserAuthError(err.message);
    }
    
}

export {createUser, loginUser, authenticateToken};





