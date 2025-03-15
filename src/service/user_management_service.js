import {saveUser, getUserByUsername} from '../repositeries/user_repositery.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserAuthError } from '../utils/exeption.js';

async function createUser(credentials) {
   try{
    const {username, email, password, role, phone, address} = credentials;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await saveUser({username, email, hashedPassword, role, phone, address});
    return result;
   }
    catch(err){
        throw err;
    }
}

async function loginUser(credentials) {
    try{
        const {username, password} = credentials;
        const user = await getUserByUsername(username);
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(isPasswordValid){
            const token = jwt.sign({ id: user.id, role: user.role}, process.env.JWT_SECRET, { expiresIn: '1h' });
            return { token: token, userId: user.id, role: user.role}; // Return both token and userId
        }
        
    }
    catch(err){
        throw err;
    }
}

function authenticateToken(allowedRoles = []) {
    return (req, res, next) => {
        const token = req.header('Authorization');  // Get the token from the Authorization header

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        try {
            const tokenWithoutBearer = token.replace(/^Bearer\s+/i, '');  // Remove "Bearer " prefix if exists
            const decodedToken = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET); // Decode the token using the secret
            
            console.log("Decoded token:", decodedToken); // Log for debugging

            req.user = decodedToken; // Attach decoded user info (id) to the request object
            
            // Role-based authorization check
            if (allowedRoles.length && !allowedRoles.includes(decodedToken.role)) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }

            next(); // Proceed to the next middleware
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });  // Token verification failed
        }
    };
}



export {createUser, loginUser, authenticateToken};





