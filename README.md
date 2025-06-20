# 🚀 Alfa Hardware Store Management System – Backend API Service

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-brightgreen" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-Framework-blue" alt="Express.js" />
  <img src="https://img.shields.io/badge/MySQL-Database-orange" alt="MySQL" />
  <img src="https://img.shields.io/badge/Prisma-ORM-lightgrey" alt="Prisma" />
  <img src="https://img.shields.io/github/license/Alfa-IT-Project/Backend" alt="License" />
</p>

> **Next-Gen Enterprise Solution for Hardware Store Management**  
> _Seamlessly manage your business with robust, scalable, and integrated features._

---

## 🏪 About the Project

A comprehensive enterprise management system for hardware stores, built with Node.js and a modular, scalable architecture. This all-in-one backend platform integrates every essential business component: **inventory, suppliers, customers, delivery, staff, and more** – all designed for modern business efficiency.

---

## 🎯 Core Features

### 👤 User Management
- 🔒 Complete authentication & authorization (JWT)
- 🛡️ Role-based access control
- 👤 User profile & password management

### 🤝 Customer Relationship Management (CRM)
- 📋 Customer data & interaction history
- ⭐ Preferences, feedback, and communication tracking

### 📦 Inventory Management
- 📈 Real-time stock tracking with alerts
- 🏷️ Product categories, valuation, and lifecycle
- 🏷️ Barcode/QR code support

### 🛒 Supplier Order Management
- 🗂️ Supplier database & order lifecycle
- 📊 Performance metrics & automated reordering

### 🚚 Delivery Management
- 🗺️ Route optimization & real-time tracking
- 📦 Delivery and driver management

### 👩‍💼 Staff Management
- 🕒 Attendance, leave, payroll, and performance tracking
- 📅 Schedule & training management

---

## ⚙️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Email:** Nodemailer
- **SMS:** Twilio
- **Docs:** Swagger UI
- **Logging:** Winston
- **PDF Generation:** PDFKit

---

## 🚦 Prerequisites

- Node.js (Latest LTS)
- MySQL Server
- npm or yarn

---

## 🛠️ Quick Start

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd Backend-1
   ```

2. **Install dependencies:**
   ```bash
   cd src
   npm install
   ```

3. **Set up environment variables:**  
   Create `.env` in `src` with:
   ```
   DATABASE_URL=your_mysql_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=4000
   ```

4. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## 🏃 Running the Application

1. **Start the development server:**
   ```bash
   npm start
   ```
2. Open in your browser: [http://localhost:4000](http://localhost:4000)

---

## 📖 Beautiful API Docs

Interactive API documentation is available through Swagger UI at:  
[http://localhost:4000/api-docs](http://localhost:4000/api-docs)

---

## 🗂️ Project Structure

```
src/
├── bin/              # Server startup scripts
├── controllers/      # Request handlers
├── middlewares/      # Custom middleware functions
├── models/           # Database models
├── routes/           # API route definitions
├── routers/          # Additional route handlers
├── service/          # Business logic layer
├── utils/            # Utility functions
├── prisma/           # DB schema & migrations
├── app.js            # Main app file
└── index.js          # Entry point
```

---

## 🌐 API Endpoints at a Glance

### 1️⃣ User Management
- `POST /api/auth/login` – User login
- `POST /api/auth/register` – Register new user (Admin only)
- `POST /api/auth/validate` – Validate user existence
- `GET /api/users` – Get all users
- `GET /api/users/:id` – Get user by ID
- `PUT /api/users/:id` – Update user
- `DELETE /api/users/:id` – Delete user

### 2️⃣ CRM
- `GET /customers/getCustomers` – All customers (GM only)
- `POST /customers/addCustomer` – Add customer (GM only)
- `PUT /customers/:id/updateCustomer` – Update customer
- `DELETE /customers/:id/deleteCustomer` – Delete customer (GM only)
- `GET /customers/getCustomersByTier/:tier` – Customers by loyalty tier
- `GET /rewards` / `POST /rewards` / `PUT /rewards/:id` / `DELETE /rewards/:id` – Rewards management

### 3️⃣ Inventory
- `GET /hardware_inventory` – All inventory items
- `POST /add_item` – Add inventory item
- `PUT /api/inventory/update/:id` – Update item
- `DELETE /api/inventory/delete/:id` – Delete item
- `GET /api/inventory/:id` – Get item by ID
- `GET /api/pm-dashboard` – Inventory stats

### 4️⃣ Supplier Orders
- `GET /purchases` – All purchase orders
- `POST /purchases` – Create purchase order
- `PUT /purchases/:id` – Update order
- `DELETE /purchases/:id` – Delete order
- `GET /purchases/supplier/:id` – By supplier
- `GET /purchases/status/:status` – By status

### 5️⃣ Delivery
- `GET /delivery/orders` – All delivery orders
- `POST /delivery/orders` – New delivery order
- `PUT /delivery/orders/:id` – Update status
- `GET /delivery/orders/:id` – Delivery details
- `GET /delivery/routes` / `POST /delivery/routes` / `PUT /delivery/routes/:id` – Route management

### 6️⃣ Staff
- `GET /api/attendance` / `POST /api/attendance` – Attendance
- `GET /api/leaves` / `POST /api/leaves` – Leave requests
- `GET /api/payroll` – Payroll info
- `GET /api/schedules` / `POST /api/schedules` – Scheduling
- `GET /api/performance` / `POST /api/performance` – Performance
- `GET /api/settings` / `PUT /api/settings` – System settings

> **Note:**  
> All endpoints require JWT authentication. Many have role-based access (RBAC).

---

## 🤲 Contributing

1. Fork the repository
2. Create your branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add some AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request 🚀

---

## 📄 License

Licensed under the MIT License – see the LICENSE file for details.

---

## 👥 Authors & Contributors

| Name | Role | GitHub |
|------|------|--------|
| **KUMARI M. A. D. N.** | Login & CRM, Project Lead | [nadee2k](https://github.com/nadee2k) |
| **KAPUWELLA K. G. N. D.** | Inventory Management | [NipunDemintha](https://github.com/NipunDemintha) |
| **VITHANA Y. S. D.** | Staff Management | [diw-666](https://github.com/diw-666) |
| **AYYASH M. R. Y.** | Delivery Management | [yahiyaiyash](https://github.com/yahiyaiyash) |
| **BISHRU R. M.** | Supplier Orders | [Bishru182](https://github.com/Bishru182) |

---

## 🌟 Acknowledgments

- Express.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors who have helped shape this project

---

<p align="center">
  <b>🚀 Transforming hardware retail, one API at a time!</b>
</p>
