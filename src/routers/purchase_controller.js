import { getAllPurchases, getPurchaseByPurchaseId , getPurchasesByTime} from "../repositeries/purchase_repositery.js";
import { createPurchase, updatePurchase } from "../service/purchase_sevice.js";
import express from "express";
import { authenticateToken } from "../service/user_management_service.js";
const router = express.Router();

router.get('/getAllPurchases',authenticateToken(['general_manager']), async (req, res) => {
    try {
        const purchases = await getAllPurchases();
        console.log(purchases);
        res.json(purchases);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

router.get('/getPurchasesByTime',authenticateToken(['general_manager']), async (req, res) => {
    try {
        const purchases = await getPurchasesByTime();
        console.log(purchases);
        res.json(purchases);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

router.get('/getPurchaseByPurchaseId', authenticateToken(['general_manager', 'customer']), async (req, res) => {
    try {
        const purchase_id = req.query.purchaseId;
        const purchase = await getPurchaseByPurchaseId(purchase_id);
        res.json(purchase);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

router.delete('/deletePurchasePerCustomer', authenticateToken(['general_manager']), async (req, res) => {
    try {
        const purchase_id = req.query.purchaseId;
        const purchase = await deletePurchasePerCustomer(purchase_id);
        res.json(purchase);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

router.post('/addPurchasePerCustomer', authenticateToken(['general_manager']), async function (req, res) {
    try{
        const credentials =req.body;
        const result = await createPurchase(credentials);

        if(result){
            res.send('Purchase add successfully');
        }
    }catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

router.post('/updatePurchasePerCustomer', authenticateToken(['general_manager']), async function (req, res) {
    try{
        const credentials =req.body;
        const result = await updatePurchase(credentials);

        if(result){
            res.send('Purchase updated successfully');
        }
    }catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
 
});

router.get('/generatePurchaseReport', authenticateToken(['general_manager']), async (req, res) => {
    try {
        const purchases = await getAllPurchases();
        console.log(purchases);
        res.json(purchases);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
}
);
 export default router;