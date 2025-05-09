import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import nodemailer from 'nodemailer';
dotenv.config();
import user_routers from './routers/user_controller.js';
import customer_routers from './routers/customer_controller.js';
import purchase_routers from './routers/purchase_controller.js';
import rewards_routers from './routers/rewards_controller.js';

import performanceRoutes from './routes/performance.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import exp from 'constants';
import cors from 'cors'

const port = 4000;

var app = express();

const corsOptions = {
    origin: 'http://localhost:3000', // Your React app's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials (cookies, authorization headers, etc)
    optionsSuccessStatus: 200
  };

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));

app.use('/users', user_routers);
app.use('/customers', customer_routers);
app.use('/purchases', purchase_routers);
app.use('/rewards', rewards_routers);

app.use('/api/performance', performanceRoutes);
app.use('/api/settings', settingsRoutes);
const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
});

/*Inventory records*/
//-------------------------------------------------------------------------------
// Add a new item
app.post("/add_item", (req, res) => {
  const { product_name, category, quantity, price, supplier_name, date_added } = req.body;

  console.log("Received data:", req.body);

  // Input validation
  if (!product_name || !category || !quantity || !price || !supplier_name || !date_added) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Ensure quantity and price are valid numbers
  if (isNaN(quantity) || isNaN(price)) {
    return res.status(400).json({ error: "Quantity and price must be valid numbers" });
  }

  const sql = "INSERT INTO item (product_name, category, quantity, price, supplier_name, date_added) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [product_name, category, quantity, price, supplier_name, date_added];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log("Item added with ID:", result.insertId);
    return res.status(201).json({ success: "Item added successfully", itemId: result.insertId });
  });
});

// Get all items
app.get("/hardware_inventory", (req, res) => {
  const sql = "SELECT * FROM item";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    return res.json(result);
  });
});

// Get a specific item by ID
app.get("/api/inventory/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM item WHERE item_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json(result[0]); // Return single item object
  });
});

// Update an existing item
app.put("/api/inventory/update/:id", (req, res) => {
  const id = req.params.id;
  const { product_name, category, quantity, price, supplier_name, date_added } = req.body;

  // Input validation
  if (!product_name || !category || !quantity || !price || !supplier_name || !date_added) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Ensure quantity and price are valid numbers
  if (isNaN(quantity) || isNaN(price)) {
    return res.status(400).json({ error: "Quantity and price must be valid numbers" });
  }

  const sql = "UPDATE item SET product_name = ?, category = ?, quantity = ?, price = ?, supplier_name = ?, date_added = ? WHERE item_id = ?";
  const values = [product_name, category, quantity, price, supplier_name, date_added, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to update item" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json({ success: "Item updated successfully" });
  });
});

// Delete item by ID
app.delete("/api/inventory/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM item WHERE item_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Something unexpected has occurred", error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json({ success: "Item deleted successfully" });
  });
});

// Product Manager Dashboard Summary
app.get("/api/pm-dashboard", (req, res) => {
  const stats = {};

  const totalSql = "SELECT COUNT(*) AS total FROM item";
  db.query(totalSql, (err, totalResult) => {
    if (err) return res.status(500).json({ error: "Failed to fetch total products" });

    stats.totalProducts = totalResult[0].total;

    const lowStockSql = "SELECT COUNT(*) AS lowStock FROM item WHERE quantity < 10";
    db.query(lowStockSql, (err2, lowStockResult) => {
      if (err2) return res.status(500).json({ error: "Failed to fetch low stock items" });

      stats.lowStockItems = lowStockResult[0].lowStock;

      const newItemsSql = `
        SELECT COUNT(*) AS newItems
        FROM item
        WHERE date_added >= CURDATE() - INTERVAL 7 DAY
      `;
      db.query(newItemsSql, (err3, newItemsResult) => {
        if (err3) return res.status(500).json({ error: "Failed to fetch new items" });

        stats.newItems = newItemsResult[0].newItems;
        return res.json(stats);
      });
    });
  });
});


/*Inventory End*/
//-------------------------------------------------------------------------------


/*Supplier records*/
// API endpoint for saving supplier data
app.post('/supplier', (req, res) => {
  const { name, sid, email, contact, address, nic, gender, remarks } = req.body;

  const sql = 'INSERT INTO suppliers (name, sid, email, contact, address, nic, gender, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, sid, email, contact, address, nic, gender, remarks], (err, result) => {
    if (err) {
      console.error('Failed to insert data: ', err);
      res.status(500).send('Error saving data');
    } else {
      res.status(200).send('Supplier data saved successfully!');
    }
  });
});

// API endpoint for fetching orders
app.get('/orders', (req, res) => {
  const sql = 'SELECT * FROM orders';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Failed to fetch orders: ', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});


// API endpoint for fetching suppliers
app.get('/suppliers', (req, res) => {
  const sql = 'SELECT * FROM suppliers';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Failed to fetch suppliers: ', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

//API endpoint which provides next supplier ID
app.get('/supplier/next-id', async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT sid FROM suppliers ORDER BY id DESC LIMIT 1");

    let nextId = "S00001"; // Default for first entry

    if (rows.length > 0 && rows[0].sid) {
      const lastSid = rows[0].sid; // e.g., "S00025"
      const numericPart = parseInt(lastSid.slice(1)); // remove 'S' and parse number
      const nextNumeric = numericPart + 1;
      nextId = "S" + nextNumeric.toString().padStart(5, '0'); // "S00026"
    }

    res.json({ nextId });
  } catch (error) {
    console.error("Error generating next supplier ID:", error);
    res.status(500).send("Error generating next supplier ID");
  }
});



// API endpoint for deleting a supplier
app.delete('/supplier/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM suppliers WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Failed to delete supplier: ', err);
      res.status(500).send('Error deleting supplier');
    } else {
      res.status(200).send('Supplier deleted successfully');
    }
  });
});

// API endpoint for deleting an order
app.delete('/order/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM orders WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Failed to delete order:', err);
      res.status(500).send('Error deleting order');
    } else {
      res.status(200).send('Order deleted successfully');
    }
  });
});

// API endpoint for updating supplier data
app.put('/supplier/:id', (req, res) => {
  const { id } = req.params;
  const { name, sid, email, contact, address, nic, gender, remarks } = req.body;
  
  console.log('Received data:', { name, sid, email, contact, address, nic, gender, remarks, id }); // Log received data

  const sql = 'UPDATE suppliers SET name = ?, sid = ?, email = ?, contact = ?, address = ?, nic = ?, gender = ?, remarks = ? WHERE id = ?';

  db.query(sql, [name, sid, email, contact, address, nic, gender, remarks, id], (err, result) => {
    if (err) {
      console.error('Error executing query:', err); // Log the error
      return res.status(500).send('Error updating supplier data: ' + err.message); // Send the error message to frontend
    } else {
      res.status(200).send('Supplier updated successfully');
    }
  });
});



// API endpoint for saving orders and sending email
app.post('/order', (req, res) => {
  const { name, email, productName, quantity, requireDate, remarks } = req.body;

  const sql = 'INSERT INTO orders (name, email, productName, quantity, requireDate, remarks) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, email, productName, quantity, requireDate, remarks], (err, result) => {
    if (err) {
      console.error('Failed to insert order data: ', err);
      return res.status(500).send('Error saving order data');
    }

    // Send Email to Supplier
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'apsarahardware088@gmail.com', // Your email
        pass: 'kwwi awsp umty wupu' // Your email password (use App Password if 2FA is enabled)
      }
    });

    const mailOptions = {
      from: 'apsarahardware088@gmail.com',
      to: email,
      subject: 'New Product Order Request',
      text: `Dear ${name},

We would like to place an order for the following product:
Product Name: ${productName}
Quantity: ${quantity}
Required Date: ${requireDate}
Remarks: ${remarks}

Please confirm the availability of the product and provide an estimated delivery date.

Thank you,
Hardware Store`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send email: ', error);
        return res.status(500).send('Error sending email');
      }
      console.log('Email sent: ' + info.response);
      res.status(200).send('Order placed and email sent successfully!');
    });
  });
});

// ✅ New: Update delivery status
app.put('/order/status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = 'UPDATE orders SET deliveryStatus = ? WHERE id = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error('Failed to update delivery status:', err);
      res.status(500).send('Error updating status');
    } else {
      res.status(200).send('Status updated successfully');
    }
  });
});
/*Supplier End*/
//-------------------------------------------------------------------------------

/*Delivery records*/

// Get all delivery records
app.get('/allDeliveries', (req, res) => {
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


/*Delivery End*/
//-------------------------------------------------------------------------------
export default app;
