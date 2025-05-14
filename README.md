# Backend API Service

#Hardware Store Management System

A comprehensive enterprise management system for hardware stores, built with Node.js. This platform integrates multiple business components—such as inventory, suppliers, customers, delivery, and staff management—for seamless operations management.

## 🚀 Features

### User Management
- Complete user authentication and authorization system
- Role-based access control
- User profile management
- Password management and security features

### Customer Relationship Management (CRM)
- Customer data management
- Customer interaction tracking
- Customer history and preferences
- Communication management
- Customer feedback system

### Inventory Management
- Real-time stock tracking
- Product categorization
- Stock level alerts
- Inventory valuation
- Product lifecycle management
- Barcode/QR code support

### Supplier Order Management
- Supplier database management
- Purchase order creation and tracking
- Order status monitoring
- Supplier performance metrics
- Automated reorder points
- Supplier communication system

### Delivery Management
- Delivery tracking system
- Route optimization
- Delivery status updates
- Driver management
- Delivery scheduling
- Real-time delivery tracking

### Staff Management
- Employee information management
- Attendance tracking
- Leave management
- Performance monitoring
- Payroll processing
- Schedule management
- Training and development tracking

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer
- **SMS Service**: Twilio
- **Documentation**: Swagger UI
- **Logging**: Winston
- **PDF Generation**: PDFKit

## 📋 Prerequisites

- Node.js (Latest LTS version recommended)
- MySQL Server
- npm or yarn package manager

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd Backend-1
   ```

2. Install dependencies:
   ```bash
   cd src
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `src` directory with the following variables:
   ```
   DATABASE_URL=your_mysql_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=4000
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🚀 Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. The server will start running on `http://localhost:4000`

## 📚 API Documentation

The API documentation is available through Swagger UI at:
```
http://localhost:4000/api-docs
```

## 🗂️ Project Structure

```
src/
├── bin/              # Server startup scripts
├── controllers/      # Request handlers
├── middlewares/      # Custom middleware functions
├── models/          # Database models
├── routes/          # API route definitions
├── routers/         # Additional route handlers
├── service/         # Business logic layer
├── utils/           # Utility functions
├── prisma/          # Database schema and migrations
├── app.js           # Main application file
└── index.js         # Application entry point
```

## �� API Endpoints

### 1. User Management
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/validate` - Validate user existence
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### 2. Customer Relationship Management (CRM)
- `GET /customers/getCustomers` - Get all customers (General Manager only)
- `POST /customers/addCustomer` - Add new customer (General Manager only)
- `PUT /customers/:id/updateCustomer` - Update customer details
- `DELETE /customers/:id/deleteCustomer` - Delete customer (General Manager only)
- `GET /customers/getCustomersByTier/:tier` - Get customers by loyalty tier
- `GET /rewards` - Get rewards program details
- `POST /rewards` - Add new reward
- `PUT /rewards/:id` - Update reward
- `DELETE /rewards/:id` - Delete reward

### 3. Inventory Management
- `GET /hardware_inventory` - Get all inventory items
- `POST /add_item` - Add new inventory item
- `PUT /api/inventory/update/:id` - Update inventory item
- `DELETE /api/inventory/delete/:id` - Delete inventory item
- `GET /api/inventory/:id` - Get item by ID
- `GET /api/pm-dashboard` - Get inventory dashboard statistics

### 4. Supplier Order Management
- `GET /purchases` - Get all purchase orders
- `POST /purchases` - Create new purchase order
- `PUT /purchases/:id` - Update purchase order
- `DELETE /purchases/:id` - Delete purchase order
- `GET /purchases/supplier/:id` - Get orders by supplier
- `GET /purchases/status/:status` - Get orders by status

### 5. Delivery Management
- `GET /delivery/orders` - Get all delivery orders
- `POST /delivery/orders` - Create new delivery order
- `PUT /delivery/orders/:id` - Update delivery status
- `GET /delivery/orders/:id` - Get delivery details
- `GET /delivery/routes` - Get delivery routes
- `POST /delivery/routes` - Create new delivery route
- `PUT /delivery/routes/:id` - Update delivery route

### 6. Staff Management
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Record attendance
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Submit leave request
- `GET /api/payroll` - Get payroll information
- `GET /api/schedules` - Get employee schedules
- `POST /api/schedules` - Create new schedule
- `GET /api/performance` - Get performance records
- `POST /api/performance` - Submit performance review
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings

Note: All endpoints require authentication using JWT tokens. Some endpoints have role-based access control (RBAC) restrictions.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

### Project Contributors

- **KUMARI M. A. D. N.** 
  - *Role:* Login Part and Customer Relationship Management
  - *GitHub:* [nadee2k](https://github.com/nadee2k)

- **KAPUWELLA K. G. N. D.**
  - *Role:* Inventory Management
  - *GitHub:* [NipunDemintha](https://github.com/NipunDemintha)

- **VITHANA Y. S. D.**
  - *Role:* Staff Management
  - *GitHub:* [diw-666](https://github.com/diw-666)

- **AYYASH M. R. Y.**
  - *Role:* Delivery Management
  - *GitHub:* [yahiyaiyash](https://github.com/yahiyaiyash)

- **BISHRU R. M.**
  - *Role:* Supplier Order Management
  - *GitHub:* [Bishru182](https://github.com/Bishru182)

### Project Lead
- **KUMARI M. A. D. N.**
  - *Role:* Project Lead
  - *GitHub:* [nadee2k](https://github.com/nadee2k)

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors who have helped shape this project
