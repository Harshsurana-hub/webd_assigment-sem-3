# 🎪 Event & Venue Booking Management System

A full-stack web application for managing event venues, bookings, and scheduling built with **Node.js**, **Express.js**, **MongoDB**, and **EJS**.

---

## ✨ Features

### Organiser Features
- **Registration & Login** — Secure account creation and authentication
- **Browse Venues** — Search and filter venues by name, capacity, facility, date, time, and rate
- **Venue Details** — View comprehensive venue information, availability, and blocked periods
- **Book Venues** — Submit booking requests with automatic price calculation
- **Booking History** — View all bookings with status filters (pending, approved, rejected, cancelled, completed)
- **Cancel Bookings** — Cancel pending or approved bookings
- **Dashboard** — Overview of total bookings, pending requests, and upcoming events
- **Alternative Suggestions** — When a venue is unavailable, see alternative venues and time slots

### Admin Features
- **Admin Dashboard** — Stats overview with total venues, active venues, today's events, revenue, and more
- **Venue Management** — Full CRUD (Create, Read, Update, Delete/Deactivate) for venues
- **Booking Management** — Approve, reject (with reason), cancel, and complete bookings
- **Venue Blocks** — Block venues for maintenance, renovation, or private use
- **Revenue Analytics** — Total revenue, monthly revenue chart, and revenue by venue
- **Venue Utilisation** — Visual utilisation percentage with progress bars for each venue

### Core Business Logic
- **Overlapping Booking Prevention** — Server-side validation prevents double-booking
- **Venue Block Enforcement** — Bookings during maintenance/blocked periods are rejected
- **Capacity Validation** — Attendee count cannot exceed venue capacity
- **Date Validation** — Cannot book venues for past dates
- **Price Calculation** — Automatic calculation: `duration × hourly rate`

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **EJS** | Server-side templates |
| **express-session** | Session management |
| **connect-mongo** | MongoDB session store |
| **bcrypt** | Password hashing |
| **dotenv** | Environment variables |
| **method-override** | HTTP method override |
| **express-ejs-layouts** | EJS layout support |

---

## 📁 Folder Structure

```
/eventbook
│
├── app.js                  # Main application entry point
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
├── .env.example            # Environment template
├── README.md               # This file
│
├── /models                 # Mongoose models
│   ├── User.js
│   ├── Venue.js
│   ├── VenueBlock.js
│   └── Booking.js
│
├── /routes                 # Express route definitions
│   ├── authRoutes.js
│   ├── venueRoutes.js
│   ├── bookingRoutes.js
│   └── adminRoutes.js
│
├── /controllers            # Route handler logic
│   ├── authController.js
│   ├── venueController.js
│   ├── bookingController.js
│   └── adminController.js
│
├── /middleware              # Auth and role middleware
│   ├── auth.js
│   └── role.js
│
├── /views                   # EJS templates
│   ├── /layouts
│   ├── /partials
│   ├── /auth
│   ├── /organiser
│   └── /admin
│
├── /public                  # Static assets
│   ├── /css/style.css
│   ├── /js/script.js
│   └── /images
│
└── /seed                    # Database seeding
    └── seed.js
```

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18+) — [Download](https://nodejs.org/)
2. **MongoDB** (v6+) — [Download](https://www.mongodb.com/try/download/community)
3. **MongoDB Compass** (optional, for GUI) — [Download](https://www.mongodb.com/products/compass)

### MongoDB Installation

1. Install MongoDB Community Edition for your OS
2. Start the MongoDB service:
   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```
3. Verify MongoDB is running:
   ```bash
   mongosh
   ```

### MongoDB Compass Connection

1. Open MongoDB Compass
2. Connect to: `mongodb://127.0.0.1:27017`
3. After seeding, you'll see database: **eventVenueDB**
4. Collections: `users`, `venues`, `venueblocks`, `bookings`, `sessions`

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (or use the provided one):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/eventVenueDB
SESSION_SECRET=change_this_secret_to_something_strong
PORT=5000
```

---

## 📦 Installation & Setup

```bash
# 1. Clone/navigate to the project directory
cd eventbook

# 2. Install dependencies
npm install

# 3. Seed the database with sample data
npm run seed

# 4. Start the development server
npm run dev
```

The application will be running at: **http://localhost:5000**

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@example.com | Admin@123 |
| **Organiser** | organiser@example.com | Organiser@123 |
| **Organiser** | priya@example.com | Organiser@123 |

---

## 🗺️ Application Routes

### Public Routes
| Method | Route | Description |
|---|---|---|
| GET | `/login` | Login page |
| POST | `/login` | Process login |
| GET | `/register` | Registration page |
| POST | `/register` | Process registration |
| POST | `/logout` | Logout |

### Organiser Routes
| Method | Route | Description |
|---|---|---|
| GET | `/dashboard` | Organiser dashboard |
| GET | `/venues` | Browse & search venues |
| GET | `/venues/:id` | Venue details |
| GET | `/bookings/new/:venueId` | Booking form |
| POST | `/bookings` | Submit booking request |
| GET | `/my-bookings` | Booking history |
| POST | `/bookings/:id/cancel` | Cancel booking |
| GET | `/bookings/alternatives/:venueId` | Alternative suggestions |

### Admin Routes
| Method | Route | Description |
|---|---|---|
| GET | `/admin/dashboard` | Admin dashboard |
| GET | `/admin/venues` | Manage venues |
| GET | `/admin/venues/new` | Add venue form |
| POST | `/admin/venues` | Create venue |
| GET | `/admin/venues/:id/edit` | Edit venue form |
| POST | `/admin/venues/:id/edit` | Update venue |
| POST | `/admin/venues/:id/delete` | Delete/deactivate venue |
| GET | `/admin/bookings` | Manage bookings |
| POST | `/admin/bookings/:id/approve` | Approve booking |
| POST | `/admin/bookings/:id/reject` | Reject booking |
| POST | `/admin/bookings/:id/cancel` | Cancel booking |
| POST | `/admin/bookings/:id/complete` | Mark completed |
| GET | `/admin/blocks` | Manage venue blocks |
| POST | `/admin/blocks` | Create block |
| POST | `/admin/blocks/:id/delete` | Remove block |

---

## 🧪 Testing Checklist

- [x] Register new organiser
- [x] Login as organiser
- [x] Login as admin
- [x] Logout
- [x] Invalid login shows error
- [x] Protected routes redirect to login
- [x] Admin pages blocked for organisers
- [x] Create venue (admin)
- [x] Edit venue (admin)
- [x] Delete/deactivate venue (admin)
- [x] Search venues by name
- [x] Filter venues by capacity, facility, date/time
- [x] View venue details
- [x] Create booking request
- [x] Price calculation works
- [x] Capacity validation
- [x] Past date validation
- [x] Overlapping booking prevention
- [x] Maintenance block prevention
- [x] Approve booking (admin)
- [x] Reject booking with reason (admin)
- [x] Cancel booking (organiser & admin)
- [x] Complete booking (admin)
- [x] View booking history with filters
- [x] Admin dashboard stats
- [x] Revenue display
- [x] Venue utilisation
- [x] Today's events
- [x] Alternative venue suggestions
- [x] Responsive design (mobile/tablet/desktop)

---

## 📝 License

ISC

---

Built with ❤️ using Node.js, Express, MongoDB, and EJS
