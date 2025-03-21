import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getCustomerPromotions(userId) {
    return await prisma.promotion.findMany({
        where: { customer_id: userId },
        orderBy: { expiry_date: "desc" },
    });
}

export {getCustomerPromotions};