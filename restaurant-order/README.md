# Restaurant Menu & Table Order System (PS6)

A full-stack MERN (MongoDB Atlas, Express.js, React.js, Node.js) web application designed for the food and hospitality industry. The system allows dine-in customers to browse digital menus with dietary filters, manage their cart, select a table, and place orders. Restaurant managers/admins have role-based access to manage menus, update order statuses, configure dining tables, track real-time kitchen tickets, and monitor revenue analytics on a live dashboard.

---

## 📸 YouTube & Project Presentation Assets

- **Video Thumbnail:** `thumbnail.jpg` (16:9 ratio, 1280x720, included in root)
- **YouTube Title Format:** `Restaurant Menu & Table Order System | MERN Stack Project | React.js, Node.js, Express & MongoDB`

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite), React Router v6 (`BrowserRouter`, `<NavLink>`, `<Routes>`, `useParams`, `useNavigate`), Vanilla CSS
- **Backend:** Node.js, Express.js (REST API, CommonJS)
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** JWT (JSON Web Tokens), `bcryptjs` password hashing, Role-Based Access Control (`customer` & `admin`)
- **Deployment:** Vercel (Frontend SPA with `vercel.json` rewrites), Render (Backend Express API)

---

## 📌 Problem Statement & Core Requirements

1. **Role-Based Authentication:**
   - Registration and Login for **Customer** and **Admin/Staff**.
   - Secure passwords hashed with `bcryptjs`.
   - JWT tokens stored in `localStorage` and passed in `Authorization: Bearer <token>` headers.
   - Protected routes using teacher's `Lect-16` style `auth` and `authorizeRoles("admin")` middleware.
   - Frontend `ProtectedRoute.jsx` component that redirects unauthorized users with `<Navigate>`.

2. **Menu Management (CRUD):**
   - Admin can add, update, delete dishes with name, category, price, pure-veg indicator, availability status, image URL, and description.
   - Shared form component (`MenuForm.jsx`) reused across Add (`/admin/menu/new`) and Edit (`/admin/menu/:id/edit`).
   - One-click availability toggle on the menu page.

3. **Table Management (CRUD):**
   - Staff/Admin can view, create, and remove dining tables with table numbers and seating capacities (`/admin/tables`).

4. **Customer Ordering & Cart:**
   - Real-time search by dish name, category selector, and Pure Vegetarian toggle.
   - Dynamic detail route (`/menu/:id`) using `useParams` for dish details and direct Add-to-Cart.
   - State managed in `App.jsx` + `localStorage` and passed as props without Redux bloat.
   - Dining table selection dropdown at checkout.

5. **Backend Security & Business Rules:**
   - **Availability Enforcement:** Unavailable dishes cannot be ordered (backend checks `isAvailable` from database and rejects if out of stock).
   - **5% GST & Grand Total Calculation:** Calculated and strictly enforced on the backend (never trusted from frontend).
   - **Order Cancellation Policy:** A customer can cancel their order **only** while the status is `Placed`. Once moved to `Preparing` or later, cancellation is blocked.
   - **Status Workflow:** `Placed` → `Preparing` → `Served` → `Paid` / `Cancelled`.

6. **Order History & Itemised Bills:**
   - Customer `/my-orders` page showing order history, order status badge, and cancel action for `Placed` orders.
   - Dynamic order detail route (`/orders/:id`) displaying itemised bill breakdown (Subtotal, 5% GST, Grand Total).

7. **Admin Sales & Performance Dashboard (`/admin/dashboard`):**
   - Today's orders count and today's total revenue.
   - All-time order volume and lifetime revenue.
   - Top 5 best-selling dishes with total quantity sold and revenue generated.
   - Category-wise sales breakdown (Starters, Main Course, Breads, Beverages, Desserts).

---

## 👥 Test Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gmail.com` | `admin123` |
| **Customer** | `test.99@gmail.com` | `password123` |

*(You can also register a new account on `/register`)*

---

## 📁 Directory Structure

```text
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, getMe
│   │   ├── menuController.js     # Menu CRUD and availability toggle
│   │   ├── tableController.js    # Dining table CRUD
│   │   ├── orderController.js    # Place order, 5% GST rule, status updates, cancel rule
│   │   └── dashboardController.js# Today's orders/revenue, top 5 items, category breakdown
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization
│   │   └── errorHandler.js       # Centralized error handler with proper HTTP status codes
│   ├── models/
│   │   ├── User.js               # User schema (name, email, password, role)
│   │   ├── MenuItem.js           # Dish schema (name, category, price, isVeg, isAvailable, image)
│   │   ├── Table.js              # Table schema (tableNumber, capacity, status)
│   │   └── Order.js              # Order schema (tableNumber, items, subtotal, tax, grandTotal, status)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── tableRoutes.js
│   │   ├── orderRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example              # Sample environment configuration
│   ├── app.js                    # Express app setup and middleware
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with NavLink and role-based links
│   │   │   ├── ProtectedRoute.jsx# Role protection with <Navigate>
│   │   │   └── MenuForm.jsx      # Shared form component for Add and Edit dish
│   │   ├── pages/
│   │   │   ├── Login.jsx         # /login
│   │   │   ├── Register.jsx      # /register
│   │   │   ├── Menu.jsx          # /menu (search, category filter, veg-only toggle)
│   │   │   ├── MenuItemDetail.jsx# /menu/:id (dish detail view)
│   │   │   ├── Cart.jsx          # /cart (table selector, bill summary, checkout)
│   │   │   ├── MyOrders.jsx      # /my-orders (order list, status badges, cancel button)
│   │   │   ├── OrderDetail.jsx   # /orders/:id (itemised bill breakdown)
│   │   │   ├── AdminDashboard.jsx# /admin/dashboard (sales metrics, top 5, category sales)
│   │   │   ├── AdminOrders.jsx   # /admin/orders (order status workflow management)
│   │   │   ├── AdminTables.jsx   # /admin/tables (manage dining tables)
│   │   │   ├── AdminMenuNew.jsx  # /admin/menu/new (uses MenuForm)
│   │   │   └── AdminMenuEdit.jsx # /admin/menu/:id/edit (uses MenuForm)
│   │   ├── App.jsx               # Routes, cart and user state
│   │   ├── index.css             # Styling and layout
│   │   └── main.jsx              # BrowserRouter root
│   ├── vercel.json               # SPA client-side routing rewrites
│   ├── vite.config.js            # Vite configuration with API proxy
│   └── package.json
├── thumbnail.jpg                 # 16:9 YouTube video thumbnail
└── README.md
```

---

## 🚀 Setup & Local Execution Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `backend/.env` file:
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.tclgzmu.mongodb.net/restaurantDB?retryWrites=true&w=majority
JWT_SECRET=my_restaurant_secret_key_123
```

Start the backend:
```bash
npm start
```
*(Server listens on `http://localhost:3000`)*

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*(Application runs on `http://localhost:5173`)*

---

## 🌐 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register customer or admin
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Fetch authenticated user details

### Menu Items (`/api/menu`)
- `GET /api/menu` - Fetch all dishes
- `GET /api/menu/:id` - Fetch single dish details
- `POST /api/menu` - Admin: Add new dish
- `PUT /api/menu/:id` - Admin: Update dish
- `PATCH /api/menu/:id/toggle` - Admin: Toggle dish availability
- `DELETE /api/menu/:id` - Admin: Delete dish

### Tables (`/api/tables`)
- `GET /api/tables` - Fetch all tables
- `POST /api/tables` - Admin: Add table
- `DELETE /api/tables/:id` - Admin: Delete table

### Orders (`/api/orders`)
- `POST /api/orders` - Customer: Place order (validates availability, computes 5% GST)
- `GET /api/orders/my-orders` - Customer: Fetch personal order history
- `GET /api/orders/:id` - Customer/Admin: Fetch itemised bill
- `PATCH /api/orders/:id/cancel` - Customer: Cancel order (`Placed` status only)
- `GET /api/orders/all` - Admin: Fetch all restaurant orders
- `PATCH /api/orders/:id/status` - Admin: Update status (`Placed` → `Preparing` → `Served` → `Paid` / `Cancelled`)

### Dashboard Analytics (`/api/dashboard`)
- `GET /api/dashboard/stats` - Admin: Today's orders & revenue, lifetime stats, top 5 selling items, category sales

