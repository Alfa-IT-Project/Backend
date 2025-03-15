const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getCustomers() {
    try {
        const customers = await prisma.user.customer.findMany();
        return customers;
    }
    catch (err) {
        throw err;
    }
}

async function saveCustomer(params) {
    
}

export { getCustomers, saveCustomer };