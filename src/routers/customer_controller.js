import express from "express";
import { addCustomer, deleteCustomer, getCustomers, updateCustomer } from "../routers/customer_controller.js";
import { authenticateToken } from "../services/user_management_service.js";

//router.get("/", getCustomers);
router.post("/", addCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

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

export default router;