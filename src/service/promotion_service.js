import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAndCreatePromotion(userId) {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: userId },
            include: { purchases: true }
        });

        if (!customer || customer.purchases.length === 0) return;

        const totalPurchases = customer.purchases.length;
        const totalSpent = customer.purchases.reduce((sum, p) => sum + parseFloat(p.grand_total), 0);

        let discount = 0;
        if (totalPurchases >= 5) {
            discount = 10; // 10% discount for 5 purchases
        } else if (totalSpent > 500) {
            discount = 15; // 15% discount for spending over $500
        }

        if (discount > 0) {
            await prisma.promotion.create({
                data: {
                    customer_id: userId, // Directly linked to customer
                    promo_code: `PROMO${Date.now()}`,
                    discount: discount,
                    expiry_date: new Date(new Date().setMonth(new Date().getMonth() + 1)) // 1-month expiry
                }
            });
            console.log(`Promotion created for customer ${userId}: ${discount}% discount`);
        }
    } catch (error) {
        console.error("Error checking promotions:", error);
    }
}

export { checkAndCreatePromotion };