import express, { response } from "express";
import { deleteCustomerById, getCustomers, getCustomerPurchases} from "../repositeries/customer_repositery.js";
import { authenticateToken } from "../service/user_management_service.js";
import { createCustomer , sendSMS} from "../service/customer_service.js";
import { Prisma } from '@prisma/client';
import { updateCustomerDetails } from '../repositeries/customer_repositery.js';
import { createUser } from "../service/user_management_service.js";
const router = express.Router();

router.get('/getCustomers', authenticateToken(['general_manager']), async (req, res) => {
    try {
        console.log("role", req.user.role);
        const customers = await getCustomers();
        res.json(customers);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
 });

// router.get('/getPurchasesByCustomerId', authenticateToken(['customer']), async (req, res) => {
//     try {
//         const user_id = req.user.user_id;
//         const purchases = await getCustomerPurchases(user_id);
//         res.json(purchases);
//     }
//     catch(err){
//         console.log(err);
//         res.status(500).send('Internal server error');
//     }
// });

router.post('/addCustomer', authenticateToken(['general_manager']), async function (req, res) {
    try{
        const credentials =req.body;
        const result = await createCustomer(credentials);
        // // Send SMS with credentials
        // if (phone) {
        //    await sendSMS(phone, username, password);
        // }
         if(result){
             res.send('Customer add successfully');
         }
    }catch(err){
        if (err instanceof Prisma.PrismaClientKnownRequestError){
            if(err.code === 'P2002'){
                res.status(400).send('Customer already exists');
            }
        }
    }
});

// router.post('/:id/updateCustomer', authenticateToken(['customer', 'general_manager']), async function (req, res, next) {

//     try{
//         const credentials = req.body;
//         console.log("Body", req.body);
//         const result = await updateCustomer(credentials);

//         if(result){
//             res.send('Customer updated successfully');
//         }
//     }catch(err){
//         console.log(err);
//         res.status(500).send('Internal server error');
//     }
// });
router.put("/:id/updateCustomer", authenticateToken(['customer', 'general_manager']), async (req, res) => {
    const customerId = parseInt(req.params.id);  // This is the customer ID from the URL
    const userId = req.user.id;  // Get the user ID from the JWT token payload

    if (userId !== customerId ) {
        return res.status(403).json({ message: "You do not have permission to update this customer." });
    }
   
    try {
        const updatedCustomer = await updateCustomerDetails(customerId, req.body);
       
        console.log(updatedCustomer);
        res.json(updatedCustomer);
    } catch (error) {
        console.error(error); 
        res.status(500).send(error.message);
    }
});


router.delete("/:id/deleteCustomer", authenticateToken(['general_manager']), async (req, res) => {
    const customerId = parseInt(req.params.id); // Get the customerId from the URL
    const userId = req.user.id; // Get the userId from the JWT token payload

    // Check if the user is authorized to delete this customer
    if (userId !== customerId && req.user.role !== 'general_manager') {
        return res.status(403).json({ message: "You do not have permission to delete this customer." });
    }

    try {
        // Delete the customer and associated user from the database
        const deletedCustomer = await deleteCustomerById(customerId);

        // Respond with a success message
        res.json({ message: "Customer deleted successfully.", deletedCustomer });
    } catch (error) {
        console.error(error);  // Logs the error for debugging
        res.status(500).send('Error deleting customer: ' + error.message);
    }
});


export default router;

