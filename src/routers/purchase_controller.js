import { getAllPurchases, getPurchaseByPurchaseId , getPurchasesByTime, getLastMonthRange} from "../repositeries/purchase_repositery.js";
import { createPurchase, updatePurchase } from "../service/purchase_sevice.js";
import express from "express";
import { authenticateToken } from "../service/user_management_service.js";
import { PrismaClient } from '@prisma/client';
import  PDFDocument  from 'pdfkit';
import pkg from 'pdfkit';
const prisma = new PrismaClient();
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

router.post('/', authenticateToken(['general_manager']), async (req, res) => {
    try {
     
      const { startDate, endDate } = getLastMonthRange();
  
      const purchases = await prisma.purchase.groupBy({
        by: ['order_date'],
        _sum: { grand_total: true },
        where: {
          order_date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { order_date: 'asc' },
      });
  
      
      let dailyData = generateDateRange(startDate, endDate);
  
      dailyData = dailyData.map((day) => {
        const match = purchases.find((data) => data.order_date.toISOString().split('T')[0] === day.order_date);
        return match ? { ...day, grand_total: match._sum.grand_total || 0 } : day;
      });
  
      res.json(dailyData);
    } catch (error) {
      console.error("Error fetching purchase data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

 // Helper function to generate daily data for the past month
 function generateDateRange(start, end) {
    let dates = [];
    let currentDate = new Date(start);
  
    while (currentDate <= end) {
      dates.push({
        order_date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
        grand_total: 0, // Default value
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }
  
router.post('/download', authenticateToken(['general_manager']), async (req, res) => {
    try {
        const { start_date, end_date } = req.body;

        const purchases = await prisma.purchase.findMany({
            where: {
                order_date: {
                    gte: start_date,
                    lte: end_date,
                },
            },
            orderBy: { order_date: 'asc' },
        });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Start Date: ${start_date}`);
        doc.text(`End Date: ${end_date}`);
        doc.moveDown();

        purchases.forEach((purchase) => {
            doc.text(`Date: ${purchase.order_date} | Amount: $${purchase.grand_total}`);
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Error generating PDF' });
    }
});

 
  
  
 export default router;