import express from "express";
import { deleteCustomerById, getCustomers } from "../repositeries/customer_repositery.js";
import { authenticateToken } from "../service/user_management_service.js";
import { createCustomer, updateCustomer } from "../service/customer_service.js";
import { Prisma } from '@prisma/client';

const router = express.Router();

router.get('/getCustomers',authenticateToken(['general_manager']), async (req, res) => {
   try {
       const customers = await getCustomers();
       res.json(customers);
   }
   catch(err){
       console.log(err);
       res.status(500).send('Internal server error');
   }
});

router.post('/addCustomer', authenticateToken(['general_manager']), async function (req, res) {
    try{
        const credentials =req.body;
        const result = await createCustomer(credentials);

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

router.post('/:id/updateCustomer', authenticateToken(['customer', 'general_manager']), async function (req, res, next) {

    try{
        const credentials = req.body;
        const result = await updateCustomer(credentials);

        if(result){
            res.send('Customer updated successfully');
        }
    }catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

router.delete('/deleteCustomer', authenticateToken(['general_manager']), async function (req, res) {
    try {
        const { id } = req.body; 
        console.log(id);
        if (!id) return res.status(400).send("User ID is required");

        const result = await deleteCustomerById(parseInt(id));

        if (result) {
            return res.send(`Customer with ID ${id} deleted successfully`);
        } else {
            return res.status(404).send("Customer not found");
        }
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).send("Customer not found");
        }
        console.error("Unexpected error:", err);
        return res.status(500).send("Internal server error");
    }
});


export default router;

