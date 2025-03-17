import { saveCustomer } from '../repositeries/customer_repositery.js';
//const { saveCustomer } = require("../repositeries/customer_repositery.js");
import bcrypt from 'bcrypt';


async function createCustomer(credentials) {
    try {
        const { username, email, password, phone, address, notes } = credentials;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await saveCustomer({
            username,
            email,
            hashedPassword,
            role: "customer", 
            phone,
            address,
            notes,
        });

        return result;
    } catch (err) {
        throw err;
    }
}

async function updateCustomer(credentials) {
    try {
        const { id, username, email, phone, address, notes } = credentials;

        const result = await saveCustomer({
            id,
            username,
            email,
            phone,
            address,
            notes,
        });

        return result;
    } catch (err) {
        throw err;
    }
}

export { createCustomer , updateCustomer };