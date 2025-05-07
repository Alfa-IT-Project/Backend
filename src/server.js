const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 8081;
const nodemailer = require('nodemailer');

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  
    password: '',  
    database: 'deliverydata' 
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Get all delivery records
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM delivery_itemdetails';
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(result);
    });
});

// Get a single delivery item
app.get('/get/:trackingID', (req, res) => {
    const { trackingID } = req.params;
    const sql = 'SELECT * FROM delivery_itemdetails WHERE TrackingID = ?';
    db.query(sql, [trackingID], (err, result) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.json(result[0]);
    });
});

// Update delivery item
app.put('/update/:trackingID', (req, res) => {
    const { trackingID } = req.params;
    const { description, clientName, deliveryAddress, contactNumber, email, assignedDate, expectedDeliveryDate, comments } = req.body;

    const sql = `UPDATE delivery_itemdetails SET
        Description = ?, Client_Name = ?, Delivery_address = ?, Contact_Number = ?, Email = ?, Assigned_Date = ?, Expected_DeliveryDate = ?, Comments = ? WHERE TrackingID = ?`;

    db.query(sql, [description, clientName, deliveryAddress, contactNumber, email, assignedDate, expectedDeliveryDate, comments, trackingID], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Delivery item not found" });
        res.json({ message: "Data updated successfully" });
    });
});

// Delete delivery item
app.delete('/delete/:trackingID', (req, res) => {
    const { trackingID } = req.params;
    const sql = 'DELETE FROM delivery_itemdetails WHERE TrackingID = ?';
    db.query(sql, [trackingID], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item deleted successfully" });
    });
});

// Add new delivery item
app.post('/add', (req, res) => {
    const { trackingNumber, description, clientName, deliveryAddress, contactNumber, email, assignedDate, expectedDeliveryDate, comments } = req.body;
    const sql = `INSERT INTO delivery_itemdetails (TrackingID, Description, Client_Name, Delivery_address, Contact_Number, Email, Assigned_Date, Expected_DeliveryDate, Comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [trackingNumber, description, clientName, deliveryAddress, contactNumber, email, assignedDate, expectedDeliveryDate, comments], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Item added successfully", id: result.insertId });

        const { email, assignedDate, expectedDeliveryDate } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(500).json({ error: "Invalid email format" });
    }

    const assigned = new Date(assignedDate);
    const expected = new Date(expectedDeliveryDate);
    if (expected < assigned) {
        return res.status(201).json({ error: "Expected Delivery Date cannot be before Assigned Date" });
    }
    });
});

// Email transport config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pixelpulseinnovations00@gmail.com',       
        pass: 'qxtd agbo leli mhcg'           
    }
});

// Send email update
app.post('/sendemail', (req, res) => {
    const { email, trackingID, description, expectedDeliveryDate } = req.body;

    const mailOptions = {
        from: 'pixelpulseinnovations00@gmail.com',       
        to: email,
        subject: `Delivery Update - Tracking ID: ${trackingID}`,
        html: `
            <h3>Hello,</h3>
            <p>This is an update regarding your delivery:</p>
            <ul>
                <li><strong>Tracking ID:</strong> ${trackingID}</li>
                <li><strong>Description:</strong> ${description}</li>
                <li><strong>Expected Delivery Date:</strong> ${expectedDeliveryDate}</li>
            </ul>
            <p>Thank you for choosing our service.</p>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
            return res.status(500).json({ error: "Failed to send email" });
        }
        res.json({ message: "Email sent successfully" });
    });
});


// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
