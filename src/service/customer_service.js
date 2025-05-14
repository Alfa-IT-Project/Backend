import { saveCustomer , updateCustomerDetails} from '../repositeries/customer_repositery.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import twilio from 'twilio';


const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

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



async function sendSMS(phone, username, password) {
    try {
        await twilioClient.messages.create({
            body: `Your account has been created. Username: ${username}, Password: ${password}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });
    } catch (error) {
        console.error("Failed to send SMS:", error);
    }
}

export { createCustomer , sendSMS, };

