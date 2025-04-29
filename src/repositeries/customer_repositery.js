import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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

// async function saveCustomer(credentials) {
//     try {
//         let hashedPassword;

//         // Hash the password only if it's provided
//         if (credentials.password && credentials.password.trim() !== '') {
//             hashedPassword = await bcrypt.hash(credentials.password, 10);
//         }

//         // Check if the user exists
//         const existingUser = await prisma.user.findUnique({
//             where: {
//                 id: credentials.id,
//             },
//         });

//         if (existingUser) {
//             // Update the existing user
//             const updateData = {
//                 username: credentials.username,
//                 name: credentials.name,
//                 email: credentials.email,
//                 phone: credentials.phone,
//                 address: credentials.address,
//                 customer: {
//                     update: {  // Update the nested customer record
//                         notes: credentials.notes || null,
//                     }
//                 }
//             };

//             // Only update the password if a new one is provided
//             if (hashedPassword) {
//                 updateData.password = hashedPassword;
//             }

//             const result = await prisma.user.update({
//                 where: {
//                     id: credentials.id,
//                 },
//                 data: updateData,
//                 include: {
//                     customer: true, // Include the customer data in the result
//                 }
//             });
//             console.log(`updateCustomer query result:`, result);
//             return result;
//         } else {
//             // Create a new user if one doesn't exist
//             const result = await prisma.user.create({
//                 data: {
//                     username: credentials.username,
//                     name: credentials.name,
//                     email: credentials.email,
//                     phone: credentials.phone,
//                     address: credentials.address,
//                     role: "customer",
//                     customer: {
//                         create: {
//                             notes: credentials.notes || null, // Optional field
//                         },
//                     },
//                     password: hashedPassword,
//                 },
//             });

//             console.log(`saveCustomer query result:`, result);
//             return result;
//         }
//     } catch (err) {
//         throw err;
//     }
// }

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
                    // password: data.password ?? existingCustomer.user.password,
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
