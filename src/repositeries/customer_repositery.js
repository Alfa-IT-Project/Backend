import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function getCustomers() {
    try {
        const customers = await prisma.customer.findMany({
            select: { // Use select instead of include
                id: true,
                notes: true, // Now correctly included
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        role: true,
                    }
                },
                purchases: true, // Include related purchases
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

async function saveCustomer(credentials) {
    try {
        const result = await prisma.user.create({
            data: {
                username: credentials.username,
                password: credentials.hashedPassword,
                name: credentials.name,
                email: credentials.email,
                phone: credentials.phone,
                address: credentials.address,
                role: "customer", 
                customer: {
                    create: {
                        notes: credentials.notes || null, // Optional field
                    },
                },
            },
        });

        console.log(`saveCustomer query result:`, result);
        return result;
    } catch (err) {
        throw err;
    }
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

export { getCustomers, saveCustomer, getCustomerByUsername, getCustomerProfile, getCustomerPurchases, deleteCustomerById, getCustomerByUserId};
