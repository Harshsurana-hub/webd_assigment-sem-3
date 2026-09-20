require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// ========================
// DATABASE CONNECTION
// ========================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ========================
// MIDDLEWARE
// ========================

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT/DELETE via POST forms
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Make session data available in all views
app.use((req, res, next) => {
  res.locals.currentUser = {
    id: req.session.userId || null,
    name: req.session.userName || null,
    email: req.session.userEmail || null,
    role: req.session.userRole || null
  };
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.isAdmin = req.session.userRole === 'admin';
  res.locals.isOrganiser = req.session.userRole === 'organiser';

  // Flash messages
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  delete req.session.success;
  delete req.session.error;

  next();
});

// ========================
// ROUTES
// ========================

const authRoutes = require('./routes/authRoutes');
const venueRoutes = require('./routes/venueRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingController = require('./controllers/bookingController');
const { requireAuth } = require('./middleware/auth');
const { requireOrganiser } = require('./middleware/role');

// Home route
app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  if (req.session.userRole === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  return res.redirect('/dashboard');
});

// Auth routes
app.use('/', authRoutes);

// Organiser dashboard
app.get('/dashboard', requireAuth, requireOrganiser, bookingController.organiserDashboard);

// Organiser bookings
app.get('/my-bookings', requireAuth, requireOrganiser, bookingController.myBookings);

// Venue routes (organiser)
app.use('/venues', venueRoutes);

// Booking routes (organiser)
app.use('/bookings', bookingRoutes);

// Admin routes
app.use('/admin', adminRoutes);

// ========================
// ERROR HANDLING
// ========================

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    statusCode: 404,
    message: 'The page you are looking for does not exist.',
    layout: 'layouts/main'
  });
});

// General error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('error', {
    title: 'Server Error',
    statusCode: 500,
    message: 'Something went wrong. Please try again later.',
    layout: 'layouts/main'
  });
});

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
