import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class RewardsRepository {
    async createReward(data) {
        try {
            return await prisma.reward.create({ 
                data: {
                    ...data,
                    generateDate: data.generateDate || new Date(),
                    expireDate: data.expireDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });
        } catch (error) {
            throw new Error(`Failed to create reward: ${error.message}`);
        }
    }

    async getAllRewards() {
        try {
            return await prisma.reward.findMany({
                orderBy: { generateDate: 'desc' }
            });
        } catch (error) {
            throw new Error(`Failed to fetch rewards: ${error.message}`);
        }
    }

    async getRewardById(id) {
        try {
            return await prisma.reward.findUnique({ 
                where: { id },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to fetch reward: ${error.message}`);
        }
    }

    async updateReward(id, data) {
        try {
            return await prisma.reward.update({
                where: { id },
                data,
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to update reward: ${error.message}`);
        }
    }

    async deleteReward(id) {
        try {
            return await prisma.reward.delete({ where: { id } });
        } catch (error) {
            throw new Error(`Failed to delete reward: ${error.message}`);
        }
    }

    async getCustomerById(customerId) {
        try {
            return await prisma.customer.findUnique({
                where: { id: customerId },
                select: { 
                    id: true,
                    name: true,
                    email: true,
                    pointCount: true,
                    membershipTier: true
                }
            });
        } catch (error) {
            throw new Error(`Failed to fetch customer: ${error.message}`);
        }
    }

    async updateCustomerPoints(customerId, points) {
        try {
            return await prisma.customer.update({
                where: { id: customerId },
                data: { 
                    pointCount: { decrement: points }
                }
            });
        } catch (error) {
            throw new Error(`Failed to update customer points: ${error.message}`);
        }
    }

    async getActiveRewards(customerId) {
        try {
            return await prisma.reward.findMany({
                where: {
                    customerId,
                    expireDate: {
                        gt: new Date()
                    }
                },
                orderBy: { expireDate: 'asc' }
            });
        } catch (error) {
            throw new Error(`Failed to fetch active rewards: ${error.message}`);
        }
    }

    async getExpiredRewards(customerId) {
        try {
            return await prisma.reward.findMany({
                where: {
                    customerId,
                    expireDate: {
                        lte: new Date()
                    }
                },
                orderBy: { expireDate: 'desc' }
            });
        } catch (error) {
            throw new Error(`Failed to fetch expired rewards: ${error.message}`);
        }
    }
}

export default new RewardsRepository();
