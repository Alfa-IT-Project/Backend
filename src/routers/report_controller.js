import express from 'express';
import { generateReport } from '../service/report_service';

const router = express.Router();

// Endpoint to generate the report
router.post('/generate', async function (req, res) {
   try{ 
    const data = req.body;
 
    const report = await generateReport(data); // Assuming a function that generates the report
    if(report) {
        res.send('User created successfully');
        console.log("User Profile Data:", report);
    };
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send('Error generating report');
  }
});

export default router;
