import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all purchases with items
async function getAllPurchases() {
    try {
        const purchases = await prisma.purchase.findMany({
            select: {
                purchase_id: true,
                user_id: true,
                total_amount: true,
                shipping_fee: true,
                grand_total: true,
                order_date: true,
                items: {
                    select: {
                        item_id: true,
                        quantity: true,
                        item: {
                            select: {
                                item_id: true,
                                name: true,
                                price: true,
                                stock: true,
                                image_url: true,
                                category: true,
                                warranty_details: true,
                            }
                        }
                    }
                }
            }
        });

        return purchases;
    } catch (err) {
        console.error("Error fetching purchases:", err);
        throw new Error("Could not retrieve purchases");
    }
}
async function getPurchasesByTime() {
    const purchases = await prisma.purchase.findMany({
        where: {
            order_date: {
                gte: new Date(new Date().getFullYear(), 0, 1), // Start of current year
                lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // End of current month
            }
        }
    });
    return purchases;
}
// Get purchase by ID with items
async function getPurchaseByPurchaseId(purchaseId) {
    try {
        const purchase = await prisma.purchase.findUnique({
            where: { purchase_id: purchaseId },
            select: {
                purchase_id: true,
                user_id: true,
                total_amount: true,
                shipping_fee: true,
                grand_total: true,
                order_date: true,
                items: {
                    select: {
                        item: {
                            select: {
                                item_id: true,
                                name: true,
                                price: true,
                                stock: true,
                                image_url: true,
                                category: true,
                                warranty_details: true,
                            }
                        },
                        quantity: true
                    }
                }
            }
        });

        return purchase;
    } catch (err) {
        console.error("Error fetching purchase:", err);
        throw new Error("Could not retrieve purchase");
    }
}

// Delete purchase along with related PurchaseItems
async function deletePurchasePerCustomer(purchaseId) {
    try {
        // First, delete related PurchaseItem records
        await prisma.purchaseItem.deleteMany({
            where: { purchase_id: purchaseId }
        });

        // Then, delete the purchase itself
        const purchase = await prisma.purchase.delete({
            where: { purchase_id: purchaseId }
        });

        return purchase;
    } catch (err) {
        console.error("Error deleting purchase:", err);
        throw new Error("Could not delete purchase");
    }
}

export { getAllPurchases, getPurchaseByPurchaseId, deletePurchasePerCustomer,getPurchasesByTime };
