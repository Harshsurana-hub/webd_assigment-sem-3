const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// Dashboard
router.get('/dashboard', requireAuth, requireAdmin, adminController.getDashboard);

// Venues
router.get('/venues', requireAuth, requireAdmin, adminController.listVenues);
router.get('/venues/new', requireAuth, requireAdmin, adminController.getNewVenueForm);
router.post('/venues', requireAuth, requireAdmin, adminController.createVenue);
router.get('/venues/:id/edit', requireAuth, requireAdmin, adminController.getEditVenueForm);
router.post('/venues/:id/edit', requireAuth, requireAdmin, adminController.updateVenue);
router.post('/venues/:id/delete', requireAuth, requireAdmin, adminController.deleteVenue);

// Bookings
router.get('/bookings', requireAuth, requireAdmin, adminController.listBookings);
router.post('/bookings/:id/approve', requireAuth, requireAdmin, adminController.approveBooking);
router.post('/bookings/:id/reject', requireAuth, requireAdmin, adminController.rejectBooking);
router.post('/bookings/:id/cancel', requireAuth, requireAdmin, adminController.cancelBooking);
router.post('/bookings/:id/complete', requireAuth, requireAdmin, adminController.completeBooking);

// Blocks
router.get('/blocks', requireAuth, requireAdmin, adminController.listBlocks);
router.post('/blocks', requireAuth, requireAdmin, adminController.createBlock);
router.post('/blocks/:id/delete', requireAuth, requireAdmin, adminController.deleteBlock);

module.exports = router;
