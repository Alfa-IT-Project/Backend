import { getAllPurchases, getPurchaseByPurchaseId, getPurchasesByTime, getLastMonthRange } from "../repositeries/purchase_repositery.js";
import { createPurchase, updatePurchase } from "../service/purchase_sevice.js";
import express from "express";
import { authenticateToken } from "../service/user_management_service.js";
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
const prisma = new PrismaClient();
const router = express.Router();

// ... existing code ...

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
        const totalSales = purchases.reduce((sum, purchase) => sum + purchase.grand_total, 0);
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
            doc.fontSize(12)
               .text(`Order #${index + 1} - ${purchase.order_date.toLocaleDateString()}`)
               .text(`Total Amount: $${purchase.grand_total.toFixed(2)}`)
               .text('Items:');
            
            purchase.items.forEach(item => {
                doc.fontSize(10)
                   .text(`- ${item.item.name} x ${item.quantity} = $${(item.item.price * item.quantity).toFixed(2)}`);
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
        res.status(500).json({ error: 'Error generating PDF report' });
    }
});

// ... existing code ...


export default router;
