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
        const { start_date, end_date, report_type } = req.body;

        // Fetch purchases within the date range
        const purchases = await prisma.purchase.findMany({
            where: {
                order_date: {
                    gte: new Date(start_date),
                    lte: new Date(end_date),
                },
            },
            include: {
                items: {
                    include: {
                        item: true
                    }
                }
            },
            orderBy: {
                order_date: 'asc'
            }
        });

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(25).text('Sales Report', { align: 'center' });
        doc.moveDown();
        
        // Add report details
        doc.fontSize(12).text(`Report Type: ${report_type}`);
        doc.text(`Period: ${start_date} to ${end_date}`);
        doc.moveDown();

        // Add summary
        const totalSales = purchases.reduce((sum, purchase) => {
            const amount = Number(purchase.grand_total) || 0;
            return sum + amount;
        }, 0);
        const totalOrders = purchases.length;
        
        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(12)
           .text(`Total Orders: ${totalOrders}`)
           .text(`Total Sales: $${totalSales.toFixed(2)}`);
        doc.moveDown();

        // Add detailed sales data
        doc.fontSize(14).text('Detailed Sales', { underline: true });
        doc.moveDown();

        purchases.forEach((purchase, index) => {
            const purchaseDate = new Date(purchase.order_date).toLocaleDateString();
            const purchaseTotal = Number(purchase.grand_total) || 0;
            
            doc.fontSize(12)
               .text(`Order #${index + 1} - ${purchaseDate}`)
               .text(`Total Amount: $${purchaseTotal.toFixed(2)}`)
               .text('Items:');
            
            purchase.items.forEach(item => {
                const itemPrice = Number(item.item.price) || 0;
                const quantity = Number(item.quantity) || 0;
                const itemTotal = itemPrice * quantity;
                
                doc.fontSize(10)
                   .text(`- ${item.item.name} x ${quantity} = $${itemTotal.toFixed(2)}`);
            });
            
            doc.moveDown();
        });

        // Add footer
        doc.fontSize(10)
           .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        // Make sure we haven't already sent headers
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error generating PDF report' });
        }
    }
});

 
  
  
 export default router;