import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function getCustomers() {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                user: true,
                // purchases: true,
            }
        });

        return customers;
    } catch (err) {
        console.error("Error fetching customers:", err);
        throw new Error("Could not retrieve customers");
    }
}

async function getCustomerByUsername(username) {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                customer: true, // Include customer details if the user is a customer
            }
        });
        return user;
    }
    catch (err) {
        throw err;
    }       
}

async function getCustomerByUserId(user_id) {
    try{
        const customer = await prisma.user.findUnique({
            where: { id: user_id },
            include: {
                customer: true,
            }
        });
        return customer;
    }catch(err){
        throw err;
    }
}

export const saveCustomer = async ( id, body) => {
    try {
        
        const updatedCustomer = await prisma.user.update({
            where: { id: id },
            include: {
                customer: true,
            },
            data: {
                username: body.username,
                name: body.name,
                email: body.email,
                phone: body.phone,
                address: body.address,
            },
        });

        return updatedCustomer;
    } catch (error) {
       
        throw error;
    }
};

async function updateCustomerDetails(id, data) {
    const existingCustomer = await prisma.customer.findUnique({
        where: { id: parseInt(id) },
        include: { user: true },
    });
    
    if (!existingCustomer) {
        throw new Error("Customer not found");
    }
    
    return prisma.customer.update({
        where: { id: parseInt(id) },
        data: {
            user: {
                update: {
                    name: data.name ?? existingCustomer.user.name,
                    email: data.email ?? existingCustomer.user.email,
                    phone: data.phone ?? existingCustomer.user.phone,
                    address: data.address ?? existingCustomer.user.address,
                },
            },
        },
        include: { user: true },
    });
}

async function getCustomerProfile(userId) {
    try {
        console.log(`getCustomerProfile called with userId: ${userId}`);

        const customer = await prisma.customer.findUnique({
            where: { id: userId }, // id in Customer is the same as the User id
            include: {
                user: {
                    select: {
                        username: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        role: true,
                        note:true,
                    },
                },
            },
        });

        return customer; // Return customer profile if found
    } catch (err) {
        throw err;
    }
}

async function getCustomerPurchases(userId) {
    try {
        console.log(`getUserPurchases called with userId: ${userId}`);

        const purchases = await prisma.purchase.findMany({
            where: { user_id: userId }, // Get purchases for the given userId
            select: {
                purchase_id: true,
                total_amount: true,
                shipping_fee: true,
                grand_total: true,
                order_date: true,
                warranty_details: true,
                warranty: {
                    select: {
                        expiry_date: true,
                    },
                },
            },
        });

        return purchases;
    } catch (err) {
        throw err;
    }
}
async function deleteCustomerById(user_id) {
    try {
        const result = await prisma.user.delete({
            where: { id: user_id }, // Ensure the correct field name
            select: {
                role: true, // Corrected syntax
            },
        });

        console.log(`deleteCustomer query result:`, result);
        return result;
    } catch (err) {
        console.error("Error deleting customer:", err);
        throw err;
    }
}

async function SumOfPurchasesAndGetHighestPurchase() {
    try {
        const result = await prisma.$queryRaw`SELECT SUM(total_amount) as total,
         MAX(total_amount) as highest 
         FROM Purchase;`;
        return result;
    } catch (err) {
        console.error("Error fetching sum of purchases and highest purchase:", err);
        throw err;
    }
}

export { getCustomers, getCustomerByUsername, getCustomerProfile, getCustomerPurchases, deleteCustomerById, getCustomerByUserId, SumOfPurchasesAndGetHighestPurchase , updateCustomerDetails};
