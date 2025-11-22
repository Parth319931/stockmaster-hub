StockMaster – Inventory & Stock Management System

StockMaster is a full-stack web-based Inventory and Warehouse Management System designed to manage stock levels, product details, warehouse transfers, receipts, deliveries, stock adjustments, and real-time dashboard reporting.

Features

Authentication

Secure login and logout system

JWT-based authentication

Role-based access control: Admin, Manager, Staff

Forgot-password and OTP email support

Dashboard

Displays real-time KPIs:
• Total available products
• Low stock item count
• Pending receipts
• Pending deliveries
• Internal transfers

Filtering by document type, status, warehouse, category, search by SKU or name

Product and Stock Management

Create, update, view, and delete products

Track stock across multiple warehouses and rack-level locations

Reorder alerts based on minimum stock threshold

Inventory Operations

Receipts: handle incoming goods and increase quantity

Delivery Orders: handle outgoing goods and decrease quantity

Internal Transfers: move goods between locations or warehouses

Stock Adjustments: correct mismatches in physical vs recorded quantity

Stock Ledger

Transaction log of every stock movement with reference document IDs and timestamps

Technology Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

shadcn-ui

Backend

Node.js

Express.js

REST API

JWT authentication

Database

PostgreSQL

Prisma ORM

Installation and Setup

Clone the repository:

git clone <repository-url>


Navigate into project directory:

cd stockmaster


Install dependencies:

npm install


Create environment file:

cp .env.example .env


Configure database credentials and authentication keys

Run database migrations:

npx prisma migrate dev


Start development server:

npm run dev


The application runs locally at:

http://localhost:5173

Default Test Credentials (sample)

Admin Account
Email: admin@stockmaster.local

Password: Admin@123

Project Directory Structure
src/
  components/
  context/
  pages/
  api/
  hooks/
  lib/
  styles/

Deployment Options

Frontend deployment: Vercel, Netlify
Backend deployment: Railway, Render, AWS, Azure

Contributing

Contributions to improve functionality, UI/UX, documentation, or performance are welcome.
For major changes, create a feature branch and open a discussion before merging.

License

MIT License

Contact

For further queries, feature discussions or issue reports, contact:
support@stockmaster.app
 (placeholder)
