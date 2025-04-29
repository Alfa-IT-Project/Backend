import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();


async function saveUser(credentials) {
    try{
        const result = await prisma.user.create({
            data: {
                username : credentials.username,
                password: credentials.hashedPassword,
                name: credentials.name, 
                email: credentials.email,
                phone:credentials.phone,
                address:credentials.address,
                role: credentials.role,
                customer: {
                    create: {} 
                }
            }
        })
        console.log(`saveUser query result:`, result);
      return result;
    }
    catch(err){
        throw err;
    }
}

async function getUserByUsername(username) {
    try{
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })
        return user;
    }
    catch(err){
        throw err;
    }       
    
}

async function getUserProfile(userId) {
    try {
        console.log(`getUserProfile called with userId: ${userId}`);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                role: true,
                customer: {
                    select: {
                        id: true,
                        notes: true,
                        purchases: {
                            select: {
                                purchase_id: true,
                                order_date: true,
                                total_amount: true,
                                shipping_fee: true,
                                grand_total: true,
                                items: {
                                    select: {
                                        id: true,
                                        quantity: true,
                                        item: {
                                            select: {
                                                item_id: true,
                                                name: true,
                                                price: true,
                                                category: true,
                                                warranty_details: true,
                                                warranty: {
                                                    select: {
                                                        warranty_id: true,
                                                        expiry_date: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                // No need to select 'promotions' here directly from purchase
                            },
                        },
                        // Fetch promotions related to the customer
                        promotions: {
                            select: {
                                promotion_id: true,
                                promo_code: true,
                                discount: true,
                                expiry_date: true,
                            },
                        },
                    },
                },
            },
        });

        return user;
    } catch (err) {
        console.error('Error fetching user profile:', err);
        throw err;
    }
}



export {saveUser, getUserByUsername, getUserProfile};

