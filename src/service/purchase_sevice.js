import { getCustomerByUserId } from '../repositeries/customer_repositery.js';

async function createPurchase(credentials) {
    try {
        const { user_id, total_amount, shipping_fee, grand_totla, order_date, expiry_date } = credentials;
        
        const customer = await getCustomerByUserId(user_id);

        if(!customer){
            throw new Error('Customer not found');
        }   
        const result = await savePurchase({
            user_id,
            total_amount,
            shipping_fee,
            grand_totla,
            order_date,
            expiry_date,
        });

        return result;
    } catch (err) {
        throw err;
    }
}

async function updatePurchase(credentials){
    try {
        const { purchase_id, user_id, total_amount, shipping_fee, grand_totla, order_date, expiry_date } = credentials;

        const customer = await getCustomerByUserId(user_id);

        if(!customer){
            throw new Error('Customer not found');
        } 

        const result = await savePurchase({
            purchase_id,
            user_id,
            total_amount,
            shipping_fee,
            grand_totla,
            order_date,
            expiry_date,
        });
    }catch(err){
        throw err;
    }
}

export { createPurchase , updatePurchase};
