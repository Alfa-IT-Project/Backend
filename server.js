const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool (recommended for production with multiple connections)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hardware_inventory",
  port: 3307
});

// DB connection
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Gracefully shut down the server if DB connection fails
  }
  console.log("Connected to MySQL Database");
});

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
  const sql = "SELECT item_id, product_name, category, quantity, price, supplier_name, date_added FROM item";
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

// Update item by ID
app.put("/api/inventory/update/:id", (req, res) => {
  const id = req.params.id;
  const { product_name, quantity, price, supplier_name, date_added } = req.body;

  // Ensure valid quantity and price
  if (isNaN(quantity) || isNaN(price)) {
    return res.status(400).json({ error: "Quantity and price must be valid numbers" });
  }

  const sql = "UPDATE item SET product_name = ?, quantity = ?, price = ?, supplier_name = ?, date_added = ? WHERE item_id = ?";
  const values = [product_name, quantity, price, supplier_name, date_added, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Something unexpected has occurred", error: err.message });
    }

    return res.json({ success: "Item updated successfully" });
  });
});

// Delete item by ID
app.delete("/api/inventory/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM item WHERE item_id = ?"; // Ensure correct column name

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

// Server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
