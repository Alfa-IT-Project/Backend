import saveCustomer from "../repositeries/customer_repositerry";
import bcrypt from 'bcrypt';

async function createCustomer(credentials) {
    try{
     const {username, email, password, phone, address, note} = credentials;
     const hashedPassword = await bcrypt.hash(password, 10);
     const result = await saveCustomer({username, email, hashedPassword, phone, address, note});
     return result;
    }
     catch(err){
         throw err;
     }
 }
 
export { createCustomer };